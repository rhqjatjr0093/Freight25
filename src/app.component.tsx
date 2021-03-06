import React, { useEffect } from 'react';
import { YellowBox, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  light,
  dark,
  mapping,
} from '@eva-design/eva';
import {
  ApplicationProvider,
  IconRegistry,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { AppNavigator } from './navigation/app.navigation';
import { AppRoute } from './navigation/app-routes';
import { ThemeContext } from '../src/component/theme-context';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundJob from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const themes = { light, dark };
const isAndroid = Platform.OS === 'android';
const server = "https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&"

const options = {
    taskName: '위치 추적 시스템',
    taskTitle: '운전자의 위치를 추적합니다',
    taskDesc: '화물 위치 추적중...',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ffffff',
    parameters: {
        delay: 30000, // 1000 = 1s
    },
};

const App = () => {
  const [address, setAddress] = React.useState('');
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setlongitude] = React.useState('');
  const [uid, setuid] = React.useState('');
  const [theme, setTheme] = React.useState('light');
  const currentTheme = themes[theme];

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

  const toggleBackground = async () => {
    var playing = BackgroundJob.isRunning();
    playing = !playing;
    
    if (playing) {
      try {
        console.log('Trying to start background service');
        await BackgroundJob.start(taskRandom, options);
        console.log('Successful start!');
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      console.log('백그라운드를 다시시작합니다');
      playing = !playing;
      await BackgroundJob.stop();
      console.log("백그라운드 서비스 종료 완료");
      await BackgroundJob.start(taskRandom, options);
      console.log("백그라운드 서비스 재시작");
    }
  };  

  const taskRandom = async taskData => {
    await new Promise(async resolve => {
      // For loop with a delay
      const {delay} = taskData;
      
      for (let i = 0; BackgroundJob.isRunning(); i++) {        
        AsyncStorage.getItem('userType')
        .then((value) => {
          if(value == 'driver'){
            console.log('위치 추적 시작')
            isAndroid ? requestLocationAndroid() : requestLocationIos()    
          } else {
            console.log('드라이버가 아니므로 위치추적 기능을 종료합니다')
            BackgroundJob.stop();
          }
        })
        await sleep(delay);        
      }
    });
  };

  const requestLocationAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {             
        Geolocation.getCurrentPosition(
          (position) => {            
            let Templatitude = JSON.stringify(position.coords.latitude);
            let Templongitude = JSON.stringify(position.coords.longitude);

            setLatitude(Templatitude);
            setlongitude(Templongitude);
            
            fetch(server + `&lat=${Templatitude}&lon=${Templongitude}&coordType=WGS84GEO&addressType=A10&callback=callback&appKey=l7xxce3558ee38884b2da0da786de609a5be`)
            .then(response => response.json())
            .then(response => {              
              const city = JSON.stringify(response.addressInfo.city_do).replace(/\"/gi, "");
              const gu = JSON.stringify(response.addressInfo.gu_gun).replace(/\"/gi, "");
              const myeon = JSON.stringify(response.addressInfo.eup_myun).replace(/\"/gi, "");
              const dong = JSON.stringify(response.addressInfo.adminDong).replace(/\"/gi, "");
              const address = city + ' ' +gu + ' ' +myeon + ' ' + dong;
              
              const user = auth().currentUser;
              AsyncStorage.getItem('userUID')
              .then((value) => {
                if (user != null) {
                  if (value != null) {
                    console.log("Firebase 위치 추적 update : ", value);
                    var locationRef = firestore().collection('location').doc(value);
                    try {
                      locationRef.set({
                        address: address,
                        latitude: Templatitude,
                        longitude: Templongitude
                      });
                    } catch {
                      console.log('Failed assign to ' + locationRef.id);
                    }
                  }
                }
              })            
            })   
            .catch(err => console.log(err));     
          }, error => Alert.alert('Error', JSON.stringify(error)),
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000});
        
                
      }
    } catch (err) {
      console.warn(err)
    }
  }

  const requestLocationIos = async() => {
    Geolocation.getCurrentPosition(
      position => {
        var Templatitude = JSON.stringify(position.coords.latitude);
        var Templongitude = JSON.stringify(position.coords.longitude);

        setLatitude(Templatitude)
        setlongitude(Templongitude)
        
        fetch(server + `&lat=${Templatitude}&lon=${Templongitude}&coordType=WGS84GEO&addressType=A10&callback=callback&appKey=l7xxce3558ee38884b2da0da786de609a5be`)
        .then(response => response.json())
        .then(response => {
          const city = JSON.stringify(response.addressInfo.city_do).replace(/\"/gi, "");
          const gu = JSON.stringify(response.addressInfo.gu_gun).replace(/\"/gi, "");
          const myeon = JSON.stringify(response.addressInfo.eup_myun).replace(/\"/gi, "");
          const dong = JSON.stringify(response.addressInfo.adminDong).replace(/\"/gi, "");    
          const address = city + ' ' +gu + ' ' +myeon + ' ' + dong;
          setAddress(address);

          const user = auth().currentUser;
          AsyncStorage.getItem('userUID')
          .then((value) => {
          if (user != null) {
            if (value != null) {
              console.log("Firebase 위치 추적 update : ", value);
              var locationRef = firestore().collection('location').doc(value);
              try {
                locationRef.set({
                  address: address,
                  latitude: Templatitude,
                  longitude: Templongitude
                });
              } catch {
                console.log('Failed assign to ' + locationRef.id);
              }
            }
          }
        }) 
        })   
        .catch(err => console.log(err));     
      },
      error => Alert.alert('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000});
    
      
      
  };

  


  useEffect(() => {    
    toggleBackground();
  }, []);

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack}/>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <ApplicationProvider mapping={mapping} theme={currentTheme}>
            <SafeAreaProvider>
              <NavigationContainer>
                <AppNavigator initialRouteName={AppRoute.CHECK_LOGIN}/>
              </NavigationContainer>
            </SafeAreaProvider>
          </ApplicationProvider>
        </ThemeContext.Provider>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flex: 1,
  },
});

YellowBox.ignoreWarnings([
  'RCTRootView cancelTouches',
]);

export default App;