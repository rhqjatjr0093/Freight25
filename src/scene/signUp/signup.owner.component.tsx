import React, {useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  LayoutElement, 
  Divider,
  Select,
  Button,
  Input,  
} from '@ui-kitten/components';
import { SignupOwnerScreenProps } from '../../navigation/search.navigator';
import { AppRoute } from '../../navigation/app-routes';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { StackActions, NavigationActions } from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

const serverUrl = 'http://49.50.162.128:8000/';

const logCallback = (log, callback) => {
  console.log(log);
  callback;
};

export const SignupOwnerScreen = (props: SignupOwnerScreenProps): LayoutElement => {
  const [nameInput, name] = React.useState('');
  const [accountOwnerInput, accountOwner] = React.useState('');
  
  const [manNumInput, manNum] = React.useState('');
  const [companyNameInput, companyName] = React.useState('');
  const [accountNumInput, accountNum] = React.useState('');
  const [phoneNumInput, phoneNum] = React.useState('');
  const [BankValue, setBankValue] = React.useState('');

  const resetAction = CommonActions.reset({
    index: 0,
    routes: [{name: AppRoute.HOME}]
  });

  console.log(BankValue);

  const regOwner = () => {
    //분기화면이 생길 시 각 분기화면에서 타입에 맞게 처리되도록 해야 함
    //firebase jwt
    var accessToken;
    AsyncStorage.getItem('accessToken', (error,result)=>{
      if(error){
        console.log(error);
      }
      else{
        accessToken = result;
        axios
          .post(serverUrl+"verifyToken", {token: accessToken, type: "owners"})
          .then((response) => {
            let firebaseToken = JSON.stringify(response.data.firebase_token);
            auth().signInWithCustomToken(firebaseToken);
            //getProfile이 아닌 fb auth로부터 정보갱신해야할 것 같은데 논의가 필요합니다.
            //getProfile();
            AsyncStorage.setItem('fbToken', JSON.stringify(firebaseToken));
            console.log("currentAuth uid: "+auth().currentUser?.uid);

            //auth리스너와 uid를 이용한 db 저장 부분
            auth().onAuthStateChanged(function(user){
              if(user){
                //현재 로그인된 auth 본인만 접근가능하도록 규칙테스트 완료
                var ref = firestore().collection('owners').doc(user.uid);
                if(user != null){
                  console.log("firestore target uid: "+auth().currentUser?.uid);
                  try {
                    ref.update({
                      manNum: manNumInput, 
                      accountNum: accountNumInput, 
                      phoneNum: phoneNumInput,
                      bankVal: BankValue
                      });
                    props.navigation.dispatch(resetAction);
                  } catch (error) {
                    //오류 toast 출력 혹은 뒤로 가기 필요할 것 같습니다.
                    console.log(error);
                  }
                }
              }
            });
          })
          .catch((error) => {
            //verifyToken Request가 실패하는 경우
            console.log(error);
          });  
      }
    });      
  };

    return (
        <React.Fragment>
          <SafeAreaView style={{flex: 0, backgroundColor: 'white'}} />
          <View>
            <Text style={{fontWeight: 'bold', fontSize: 20, margin: 10}}>화주 회원가입</Text>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>
          <ScrollView>
          <View> 
            <Text style={styles.textStyle}>개인 정보</Text>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>성 명 :</Text>
              </View>
              <View style={{flex: 3}}>
                <Input
                  style={styles.input}
                  placeholder='성명을 적어주세요'
                  size='small'
                  value={nameInput}
                  onChangeText={name}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>전화 번호 :</Text>
              </View>
              <View style={{flex: 3 }}>
                <Input
                  style={styles.input}
                  placeholder='-를 빼고 입력하세요'
                  size='small'
                  value={phoneNumInput}
                  onChangeText={phoneNum}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>사업자 등록번호 :</Text>
              </View>
              <View style={{flex: 3}}>
                <Input
                  style={styles.input}
                  placeholder='사업자 등록번호를 입력하세요'
                  size='small'
                  value={manNumInput}
                  onChangeText={manNum}
                />
              </View>
            </View>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>

          <View> 
            <Text style={styles.textStyle}>상 하차지 정보</Text>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>자주 쓰는 주소 :</Text>
              </View>
              <View style={{flex: 3}}>
                <Text style={styles.textStyle}>API 선생님 도와주세요</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>업체명 :</Text>
              </View>
              <View style={{flex: 3}}>
                <Input
                  style={styles.input}
                  placeholder='업체명을 적어주세요'
                  size='small'
                  value={companyNameInput}
                  onChangeText={companyName}
                />
              </View>
            </View>            
            <Divider style={{backgroundColor: 'black'}}/>
          </View>

          <View style={{flex: 3}}> 
            <Text style={styles.textStyle}>계좌 정보</Text>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>거래 은행 :</Text>
              </View>
              <View style={{flex: 3 }}>
                <RNPickerSelect
                  onValueChange={(itemValue, itemIndex) => setBankValue(itemValue)}
                  placeholder={{
                    label: '은행을 선택하세요',
                    value: null,
                  }}
                  useNativeAndroidPickerStyle={false}
                  items={[
                    {label: '국민', value: 'kukmin'},
                    {label: '신한', value: 'shinhan'},
                    {label: '농협', value: 'nognhyeob'},
                  ]}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>계좌 번호 :</Text>
              </View>
              <View style={{flex: 3 }}>
                <Input
                  style={styles.input}
                  placeholder='-를 빼고 입력하세요'
                  size='small'
                  value={accountNumInput}
                  onChangeText={accountNum}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.detailTitle}>
                <Text style={styles.textStyle}>예금주 :</Text>
              </View>
              <View style={{flex: 3 }}>
                <Input
                  style={styles.input}
                  placeholder='예금주를 입력하세요'
                  size='small'
                  value={accountOwnerInput}
                  onChangeText={accountOwner}
                />
              </View>
            </View>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>
          
          <View style={{flex: 2,flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>            
              <Button style={{margin: 30}} status='danger' size='large' onPress={() => props.navigation.goBack()}>돌아가기</Button>
              <Button style={{margin: 30}} status='primary' size='large' onPress={regOwner}>회원가입</Button>
          </View>
          </ScrollView>


        </React.Fragment>
    );
};

const styles = StyleSheet.create({
  textStyle: {
    fontWeight: 'bold', 
    fontSize: 18, 
    margin: 8
  },
  detailTitle: {
    flex: 2,
    flexDirection: 'row', 
    alignItems:'center',
    justifyContent: 'flex-end'
  },
  input: {
    flex: 1,
    margin: 2,
  },
});