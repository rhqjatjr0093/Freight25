import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  LayoutElement,
  Divider,
  Select,
  Button,
  styled,
  Icon,
  Layout,
  Input,
} from '@ui-kitten/components';
import {ProfileDriverScreenProps} from '../../navigation/profile.navigator';
import {MainScreenProps} from '../../navigation/home.navigator';
import {AppRoute} from '../../navigation/app-routes';
import {
  BackIcon,
  MenuIcon,
  InfoIcon,
  LogoutIcon,
  MAPIcon,
  PHONEIcon,
  NOTEIcon,
} from '../../assets/icons';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-community/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-tiny-toast';
import axios from 'axios';
import {Value} from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import KakaoLogins from '@react-native-seoul/kakao-login';
import {CommonActions} from '@react-navigation/native';
import {ThemeContext} from '../../component/theme-context';
import {FlexStyleProps} from '@ui-kitten/components/ui/support/typings';

const resetAction = CommonActions.reset({
  index: 0,
  routes: [{name: AppRoute.AUTH}],
});

export const ProfileDriverScreen = (
  props: ProfileDriverScreenProps,
): LayoutElement => {
  const [userID, setUserID] = React.useState('');
  const [TonValue, setTonValue] = React.useState('');
  const [TypeValue, setTypeValue] = React.useState('');
  const [BankValue, setBankValue] = React.useState('');
  const [nameInput, name] = React.useState('');
  const [phoneNumInput, phoneNum] = React.useState('');
  const [accountNumInput, accountNum] = React.useState('');
  const [accountOwnerInput, accountOwner] = React.useState('');
  const [carNumInput, carNum] = React.useState('');
  const [manNumInput, manNum] = React.useState('');
  const [lock, setLock] = React.useState(0);

  const themeContext = React.useContext(ThemeContext);

  useEffect(() => {
    AsyncStorage.getItem('fbToken').then((value) => {
      if (value) {
        auth().onAuthStateChanged(function (user) {
          if (user) {
            setUserID(user.uid);
          } else {
          }
        });
      }
    });
  });

  const getDB = () => {
    if (userID) {
      var ref = firestore().collection('drivers').doc(userID);
      ref.get().then(function (doc) {
        if (doc.exists) {
          // Get the information from driver
          const docs = doc.data();
          setTonValue(docs.carTone);
          setTypeValue(docs.carType);
          setBankValue(docs.bankName);
          name(docs.name);
          phoneNum(docs.tel);
          accountNum(docs.accountNumber);
          accountOwner(docs.accountOwner);
          carNum(docs.carNumber);
          manNum(docs.companyNumber);
        }
      });
      setLock(1);
    }
  };

  if (lock == 0) {
    getDB();
  }

  const withdrawHandler = async () => {
    var user = auth().currentUser;
    var ref = firestore().collection('drivers').doc(user?.uid);
    var refFreight = firestore()
      .collection('freights')
      .where('driverId', '==', user?.uid);

    refFreight.get().then(function (doc) {
      if (doc.size == 0) {
        try {
          ref.delete().then(() => {
            console.log('1. ' + user?.uid + ' 탈퇴 시작');

            user?.delete().then(async () => {
              await KakaoLogins.logout().then((result) => {
                console.log(`2. Kakao Logout Finished:${result}`);
              });

              AsyncStorage.clear().then(() => {
                console.log('3. AsyncStorage 초기화 완료');
                withdrawAlertHandler();
              });
            });
          });
        } catch {
          (error) => {
            Toast.show('탈퇴가 실패하였습니다.');
            console.log(error);
          };
        }
      } else {
        Toast.show('기존에 등록된 화물이 존재합니다');
      }
    });
  };

  const withdrawAlertHandler = () => {
    console.log('4. 탈퇴 완료');
    Alert.alert('탈퇴가 완료되었습니다.');
    props.navigation.dispatch(resetAction);
  };

  const _twoOptionAlertHandler = () => {
    //function to make two option alert
    Alert.alert(
      //title
      '화물차 기사 회원 탈퇴',
      //body
      '정말로 탈퇴를 하시겠어요?',
      [
        {text: '네', onPress: () => withdrawHandler()},
        {
          text: '취소',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
      //clicking out side of alert will not cancel
    );
  };

  const reviseProfile = () => {
    var user = auth().currentUser?.uid;
    var ref = firestore().collection('drivers').doc(user);
    if (user != null) {
      console.log('firestore target uid: ' + auth().currentUser?.uid);
      try {
        if (TonValue != null) {
          ref.update({carTon: TonValue});
        }
        if (TypeValue != null) {
          ref.update({carType: TypeValue});
        }
        if (BankValue != null) {
          ref.update({bankName: BankValue});
        }
        ref.update({
          name: nameInput,
          accountOwner: accountOwnerInput,
          carNumber: carNumInput,
          companyNumber: manNumInput,
          accountNumber: accountNumInput,
          tel: phoneNumInput,
        });
      } catch (error) {
        //오류 toast 출력 혹은 뒤로 가기 필요할 것 같습니다.
        Toast.showSuccess('수정 실패');
        console.log(error);
      }
    }
  };

  return (
    <React.Fragment>
      <SafeAreaView style={{flex: 0, backgroundColor: 'white'}} />
      <ScrollView
        style={
          themeContext.theme == 'dark'
            ? {backgroundColor: '#222B45'}
            : {backgroundColor: '#FFFFFF'}
        }>
        <Layout style={styles.titleContainer}>
          <Text style={styles.Subtitle}>화물차 기사 정보 수정</Text>
          <Button
            onPress={() => {
              reviseProfile();
              Toast.showSuccess('수정 완료');
              props.navigation.navigate(AppRoute.HOME);
            }}
            style={styles.Button}
            textStyle={styles.ButtonText}>
            수정
          </Button>
        </Layout>
        <Layout style={styles.infoContainer}>
          <Text style={styles.Subtitle}>개인 정보</Text>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>성 명: </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="성명을 적어주세요"
                value={nameInput}
                onChangeText={name}
              />
            </Layout>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>전화 번호: </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="-를 빼고 입력하세요"
                value={phoneNumInput}
                onChangeText={phoneNum}
              />
            </Layout>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>사업자등록번호: </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="사업자 등록번호를 입력하세요"
                value={manNumInput}
                onChangeText={manNum}
              />
            </Layout>
          </Layout>
        </Layout>
        <Divider style={{backgroundColor: 'black'}} />

        <Layout style={styles.infoContainer}>
          <Text style={styles.Subtitle}>차량 정보</Text>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>차량 번호 : </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="차량 번호를 적어주세요"
                value={carNumInput}
                onChangeText={carNum}
              />
            </Layout>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>차량 톤수 : </Text>
            <RNPickerSelect
              onValueChange={(itemValue) => setTonValue(itemValue)}
              placeholder={{
                label: '차량 톤수를 선택하세요',
                value: null,
              }}
              useNativeAndroidPickerStyle={false}
              items={[
                {label: '1 톤', value: '1'},
                {label: '2.5 톤', value: '2.5'},
                {label: '5 톤', value: '5'},
                {label: '11-15 톤', value: '15'},
                {label: '25 톤', value: '25'},
              ]}
              style={
                themeContext.theme == 'dark'
                  ? {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'white',
                      },
                    }
                  : {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'black',
                      },
                    }
              }
            />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>차량 유형 : </Text>
            <RNPickerSelect
              onValueChange={(itemValue, itemIndex) => setTypeValue(itemValue)}
              placeholder={{
                label: '차량 유형을 선택하세요',
                value: null,
              }}
              useNativeAndroidPickerStyle={false}
              items={[
                {label: '카고', value: 'cargo'},
                {label: '윙카', value: 'wing'},
                {label: '냉동', value: 'ice'},
                {label: '냉장', value: 'superice'},
              ]}
              style={
                themeContext.theme == 'dark'
                  ? {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'white',
                      },
                    }
                  : {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'black',
                      },
                    }
              }
            />
          </Layout>
        </Layout>
        <Divider style={{backgroundColor: 'black'}} />

        <Layout style={styles.infoContainer}>
          <Text style={styles.Subtitle}>계좌 정보</Text>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>거래 은행: </Text>
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
              style={
                themeContext.theme == 'dark'
                  ? {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'white',
                      },
                    }
                  : {
                      placeholder: {
                        color: 'orange',
                      },
                      inputIOS: {
                        color: 'black',
                      },
                    }
              }
            />
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>계좌 번호 : </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="-를 뺴고 입력하세요"
                value={accountNumInput}
                onChangeText={accountNum}
              />
            </Layout>
          </Layout>
          <Layout style={styles.rowContainer}>
            <Text style={styles.infoTitle}>예금주 : </Text>
            <Layout style={styles.selectContainer}>
              <Input
                placeholder="예금주를 적어주세요"
                value={accountOwnerInput}
                onChangeText={accountOwner}
              />
            </Layout>
          </Layout>
        </Layout>

        <Layout style={styles.withdrawContainer}>
          <Button
            onPress={() => {
              try {
                _twoOptionAlertHandler();
              } catch (error) {
                console.log('Failed to withdraw');
                Toast.show('탈퇴 실패');
              }
            }}
            status="danger"
            style={styles.withdrawButton}
            textStyle={styles.withdrawButtonText}>
            회원 탈퇴
          </Button>
        </Layout>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  Button: {
    width: RFPercentage(12),
    height: RFPercentage(5),
    borderRadius: 8,
  },
  ButtonText: {
    fontSize: RFPercentage(1.5),
  },
  withdrawButton: {
    width: RFPercentage(14),
    height: RFPercentage(6),
    borderRadius: 8,
  },
  withdrawButtonText: {
    fontSize: RFPercentage(1.8),
  },
  titleStyles: {
    paddingHorizontal: 20,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  Subtitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 0.2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderColor: '#20232a',
    //backgroundColor: 'white',
  },
  infoContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    borderColor: '#20232a',
    justifyContent: 'space-between',
    //backgroundColor: 'white',
  },
  rowContainer: {
    paddingVertical: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectContainer: {
    flex: 1,
  },
  pickerItem: {
    color: 'black',
    fontWeight: 'bold',
  },
  withdrawContainer: {
    flex: 1,
    alignItems: 'center',
    borderColor: '#20232a',
    justifyContent: 'space-between',
    //backgroundColor: 'white',
  },
  infoTitle: {
    paddingVertical: 2,
    paddingHorizontal: 30,
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
  },
  iconSize: {
    width: 32,
    height: 32,
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: 'black',
    margin: 5,
  },
});
