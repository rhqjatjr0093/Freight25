import React, {useState} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Button, LayoutElement} from '@ui-kitten/components';
import {StopoverADScreenProps} from '../../navigation/home.navigator';
import {AppRoute} from '../../navigation/app-routes';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-tiny-toast';

export class StopoverADScreen extends React.Component<StopoverADScreenProps> {
  constructor(props) {
    super(props);
    // this.getFreightID;
  }

  componentDidMount = async () => {
    try {      
      const value = await AsyncStorage.getItem('FreightID');
      if (value !== null) {
        var freightID = value + '';
        //const freightID = {FrightID: value + ''};
        var url = '49.50.172.39:8000/stopover?freightId=' + value;
        var data = fetch(
          'http://49.50.172.39:8000/stopover?freightId=' + value,
          {},
        )
          .then((response) => response.json())
          .then((response) => {
            let length = response.length
            if(length == undefined){
              Toast.showSuccess(`경유지 화물이 없습니다 홈으로 이동합니다`);
            } else {
              Toast.showSuccess(`${length}개의 경유지 화물이 있습니다`);
              for(let i=0; i<=response.length; i++){
                AsyncStorage.setItem(`Stopover${i+1}`, response[i].id);          
              }
            }
          });
      }
    } catch (error) {}


  };

  ApplyButton = () => {
    this.props.navigation.navigate(AppRoute.STOPOVER);
  };

  DenyButton = () => {
    this.props.navigation.navigate(AppRoute.HOME);
  };

  render() {
    return (
      <React.Fragment>
        <View style={{backgroundColor: 'white', alignItems: 'center', flex: 4}}>
          <Image
            style={styles.adImage}
            source={require('../../assets/StopoverAD.jpg')}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: 'white',
            flex: 1,
          }}>
          <View style={{flex: 1}}>
            <Button
              style={{margin: 8}}
              onPress={this.ApplyButton}
              status="success">
              수 락
            </Button>
          </View>
          <View style={{flex: 1}}>
            <Button
              style={{margin: 8}}
              onPress={this.DenyButton}
              status="danger">
              거 부
            </Button>
          </View>
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  adImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    borderRadius: 15,
  },
  icon2: {
    justifyContent: 'center',
    width: 20,
    height: 15,
  },
});
