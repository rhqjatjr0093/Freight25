import React, {useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Text,
  ImageBackground,
  StyleSheet,
  View,
  Linking,
  SafeAreaView,
} from 'react-native';
import {
  Input,
  InputElement,
  InputProps,
  Button,
  CheckBox,
  Layout,
  LayoutElement,
} from '@ui-kitten/components';
import {LoadingScreenProps, AuthNavigator} from '../../navigation/auth.navigator';
import {AppRoute} from '../../navigation/app-routes';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {CommonActions} from '@react-navigation/native';

const HomeNavigate = CommonActions.reset({
  index: 0,
  routes: [{name: AppRoute.HOME}],
});

const OwnerNavigate = CommonActions.reset({
  index: 0,
  routes: [{name: AppRoute.OWNER}],
});


export const LoadingScreen = (props: LoadingScreenProps): LayoutElement => {
  AsyncStorage.getItem('fbToken')
    .then((value) => {
      if (value) {
        console.log('Login check Succeess');
        var authFlag = true;
        auth().onAuthStateChanged(function(user){
          if(authFlag){
            authFlag = false;
            if(user){
              //현재 로그인된 auth 본인만 접근가능하도록 규칙테스트 완료
              var ref = firestore().collection('drivers').doc(user.uid);
              ref.get().then(function(doc) {
                if(doc.exists){
                  AsyncStorage.setItem('userUID', user.uid).then(() =>{
                    console.log(user.uid+" Async Storage 등록 완료");                 
                  });
                  AsyncStorage.setItem('userType', 'driver').then(() =>{
                    console.log("loading AsyncStorage Type: driver");                    
                    props.navigation.dispatch(HomeNavigate);
                  });                  
                }
  
                else{
                  AsyncStorage.setItem('userUID', user.uid).then(() =>{
                    console.log(user.uid+" Async Storage 등록 완료");                 
                  });
                  AsyncStorage.setItem('userType', 'owner').then(()=>{
                    console.log("loading AsyncStorage Type: owner");
                    props.navigation.dispatch(OwnerNavigate);
                  });
                } 
              })
            }
            else{
              console.log('Login check Failed');
              props.navigation.navigate(AppRoute.SIGN_IN);
            }
          }
        })
      } 
      else {
        console.log('Login check Failed');
        props.navigation.navigate(AppRoute.SIGN_IN);
      }
    })
    .catch((error: Error) => {
      console.log('???');
    });

  return (
    <React.Fragment>
      <SafeAreaView style={{flex: 0, backgroundColor: 'white'}} />
      <ImageBackground
        style={styles.appBar}
        source={require('../../assets/image-background.png')}>
        <View style={styles.viewForm}>
          <Text style={styles.TextStyle}></Text>
        </View>
      </ImageBackground>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flex: 1,
  },
  viewForm: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnKakaoLogin: {
    width: 280,
    marginVertical: 10,
    backgroundColor: '#F8E71C',
    borderColor: '#F8E71C',
  },
  TextStyle: {},
});
