import React, {useState, Fragment, useEffect} from 'react';
import {
  StyleSheet,
  PermissionsAndroid,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
  Platform,
  NativeModules,
} from 'react-native';
import {
  Text,
  Icon,
  Button,
  Divider,
  Layout,
  LayoutElement,
} from '@ui-kitten/components';
import {DetailCheckStopoverScreenProps} from '../../navigation/check.navigator';
import {AppRoute} from '../../navigation/app-routes';
import AsyncStorage from '@react-native-community/async-storage';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-tiny-toast';
import Geolocation from 'react-native-geolocation-service';
import TextTicker from 'react-native-text-ticker';
import {ThemeContext} from '../../component/theme-context';

const phoneIcon = (style) => <Icon {...style} name="phone-outline" />;
const naviIcon = (style) => <Icon {...style} name="compass-outline" />;
const plusIcon = (style) => <Icon {...style} name="plus-outline" />;
const homeIcon = (style) => <Icon {...style} name="home-outline" />;
const cartIcon = (style) => <Icon {...style} name="shopping-cart-outline" />;
const carIcon = (style) => <Icon {...style} name="car-outline" />;

const isAndroid = Platform.OS === 'android';
const tmapRouteURL =
  'https://apis.openapi.sk.com/tmap/app/routes?appKey=l7xxce3558ee38884b2da0da786de609a5be';
const DirectSms = NativeModules.DirectSms;

export const DetailCheckStopoverScreen = (
  props: DetailCheckStopoverScreenProps,
): LayoutElement => {
  const [FreightID, setFreightID] = React.useState('');
  const [OppoFreightID, setOppoFreightID] = React.useState('');
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [ownerTel, setOwnerTel] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [recvTel, setRecvTel] = React.useState('');
  const [recvName, setRecvName] = React.useState('');
  const [startAddrNoSpace, setStartAddrNoSpace] = React.useState('');
  const [endAddrNoSpace, setEndAddrNoSpace] = React.useState('');
  const [data, setData] = React.useState([]);
  const [lastState, setState] = React.useState([]);
  const themeContext = React.useContext(ThemeContext);

  useEffect(() => {
    isAndroid ? requestLocationAndroid() : requestLocationIos();
    requestFirebase();
  }, []);

  const requestLocationAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            let latitude = JSON.stringify(position.coords.latitude);
            let longitude = JSON.stringify(position.coords.longitude);
            setLatitude(latitude);
            setLongitude(longitude);
          },
          (error) => Alert.alert('Error', JSON.stringify(error)),
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
        );
      } else {
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const requestLocationIos = () => {
    var latitude;
    var longitude;

    Geolocation.getCurrentPosition(
      (position) => {
        latitude = JSON.stringify(position.coords.latitude);
        longitude = JSON.stringify(position.coords.longitude);
        setLatitude(latitude);
        setLongitude(longitude);
      },
      (error) => Alert.alert('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const requestFirebase = async () => {
    var freightID;
    var oppoFreightID;
    try {
      const value = await AsyncStorage.getItem('FreightID');
      if (value !== null) {
        freightID = value;
        setFreightID(value);
      }
    } catch (error) {}
    try {
      const value = await AsyncStorage.getItem('OppoFreightID');
      if (value !== null) {
        oppoFreightID = value;
        setOppoFreightID(value);
      }
    } catch (error) {}

    var user = auth().currentUser;
    //const that = this;

    if (user != null) {
      var docRef = firestore().collection('freights').doc(oppoFreightID);

      // Get the selected(original) freight info from Firebase.
      docRef.get().then(async function (doc) {
        var list = [];

        if (doc.exists) {
          const docs = doc.data();
          console.log('Document data:', docs.id);

          var freightState = '';
          var startAddrArray = docs.startAddr.split(' ');
          var endAddrArray = docs.endAddr.split(' ');
          var startAddrFullArray = docs.startAddr_Full.split(' ');
          var endAddrFullArray = docs.endAddr_Full.split(' ');

          var i = 2,
            j = 2;
          var startAddrDetail = '';
          var endAddrDetail = '';
          for (i = 3; i < startAddrFullArray.length; i++) {
            startAddrDetail += startAddrFullArray[i] + ' ';
          }
          for (j = 3; j < endAddrFullArray.length; j++) {
            endAddrDetail += endAddrFullArray[j] + ' ';
          }
          var startAddrNoSpace = docs.startAddr.replace(/\s/g, '');
          var endAddrNoSpace = docs.endAddr.replace(/\s/g, '');

          if (docs.state == 0) freightState = '배송전';
          else if (docs.state == 1) freightState = '배송중';
          else if (docs.state == 2) freightState = '배송완료';

          var docStartDate = new Date(docs.timeStampAssigned._seconds * 1000);

          var moneyprint = docs.expense + '';
          moneyprint = moneyprint
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

          list.push({
            key: docs.id,
            oppositeFreightId: docs.oppositeFreightId,
            lastState: freightState, // 0 -> 배송전, 1 -> 배송중, 2 -> 배송완료
            dist: docs.dist,
            startDate: docs.startDate, // 배송 출발 날짜 -> UI 고치기
            endDate: docs.endDate,
            expense: moneyprint,
            startAddress: docs.startAddr,
            endAddress: docs.endAddr,
            startAddrFullArray: startAddrFullArray,
            endAddrFullArray: endAddrFullArray,
            startAddrArray: startAddrArray,
            endAddrArray: endAddrArray,
            startAddrDetail: startAddrDetail,
            endAddrDetail: endAddrDetail,
            startAddrNoSpace: startAddrNoSpace,
            endAddrNoSpace: endAddrNoSpace,

            startMonth: docStartDate.getMonth() + 1,
            startDay: docStartDate.getDate(),
            startDayLabel: docs.startDayLabel,
            driveOption: docs.driveOption,

            recvName: docs.recvName,
            recvTel: docs.recvTel,

            ownerId: docs.ownerId,
            ownerTel: docs.ownerTel,
            ownerName: docs.ownerName,
            desc: docs.desc,
          });

          setData(list);
          setState(freightState);
          setOwnerTel(docs.ownerTel);
          setOwnerName(docs.ownerName);
          setRecvTel(docs.recvTel);
          setRecvName(docs.recvName);
          setStartAddrNoSpace(startAddrNoSpace);
          setEndAddrNoSpace(endAddrNoSpace);
        } else {
          console.log('No such document!');
        }
      });
    }
  };

  const sendDirectSms = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'Freight25 App Sms Permission',
            message:
              'Freight25 App needs access to your inbox ' +
              'so you can send messages in background.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          DirectSms.sendDirectSms(
            recvTel,
            'Signup process completed! ' + recvName,
          );
          console.log('SMS sent successfully');
        } else {
          console.log('SMS permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      console.log('Send message');
      console.log(recvTel);

      const url = `sms:${recvTel}${Platform.OS === 'ios' ? '&' : '?'}body=${
        'signup process completed! ' + recvName
      }`;
      Linking.openURL(url).catch((err) =>
        console.error('An error occurred', err),
      );
    }
  };

  const invokeTmap = (num) => {
    if (num == 1) {
      // Route to start address
      Linking.openURL(
        tmapRouteURL +
          `&name=${startAddrNoSpace}&lat=${latitude}&lon=${longitude}`,
      );
    } else if (num == 2) {
      // Route to end address
      Linking.openURL(
        tmapRouteURL +
          `&name=${endAddrNoSpace}&lat=${latitude}&lon=${longitude}`,
      );
    }
  };

  const navHandler = () => {
    Alert.alert(
      '내비게이션 연결',
      '연결 하시겠습니까?',
      [
        {text: '상차지 경로', onPress: () => invokeTmap(1)},
        {text: '하차지 경로', onPress: () => invokeTmap(2)},
        {
          text: 'Cancel',
          onPress: () => console.log('canceled'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const callOwner = () => {
    console.log('Call to the owner');
    console.log(ownerTel);
    Linking.openURL(`tel:${ownerTel}`);
  };

  const setComplete = () => {
    sendDirectSms();
    console.log('운송 완료');
    try {
      var ref = firestore().collection('freights').doc(OppoFreightID);
      ref.update({
        state: 2,
      });
    } catch (error) {}
    Toast.showSuccess('운송 완료');
    props.navigation.navigate(AppRoute.HOME);
  };

  const completeHandler = () => {
    //function to make two option alert
    Alert.alert(
      //title
      '운송 완료',
      //body
      '운송 완료 하시겠습니까?',
      [
        {text: '네', onPress: () => setComplete()},
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

  const navigateBack = () => {
    props.navigation.goBack();
  };

  const _renderItem = ({item}) => (
    <Layout>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            flex: 3,
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingHorizontal: 10,
          }}>
          <Text style={styles.Subtitle}>경유지 화물 내역</Text>
        </View>
        <View
          style={{flex: 3, alignItems: 'flex-end', justifyContent: 'center'}}>
          {item.lastState == '배송중' ? (
            <Button
              style={styles.Badge}
              appearance="outline"
              status="danger"
              icon={carIcon}
              textStyle={styles.badgeText}>
              {item.lastState}
            </Button>
          ) : (
            <Button
              style={styles.Badge}
              appearance="outline"
              textStyle={styles.badgeText}>
              {item.lastState}
            </Button>
          )}
        </View>
      </View>

      <View style={styles.geoContainer}>
        <View style={styles.geoInfoContainer}>
          <Text style={styles.geoText}>
            {item.startAddrArray[0]} {item.startAddrArray[1]}{' '}
          </Text>
          <Text style={styles.geoText}>{item.startAddrArray[2]} </Text>
          <Text style={styles.geoSubText}>{item.startDate}</Text>
        </View>
        <View style={styles.geoInfoContainer}>
          <View>
            <Icon
              style={styles.iconSize}
              fill="#8F9BB3"
              name="arrow-forward-outline"
            />
          </View>
          <View>
            <Text style={styles.geoSubText3}>{item.driveOption}</Text>
          </View>
        </View>
        <View style={styles.geoInfoContainer}>
          <Text style={styles.geoText}>
            {item.endAddrArray[0]} {item.endAddrArray[1]}
          </Text>
          <Text style={styles.geoText}>{item.endAddrArray[2]}</Text>
          <Text style={styles.geoSubText2}>{item.endDate}</Text>
        </View>
      </View>
      <Divider style={{backgroundColor: 'black'}} />
      <View style={styles.freightInfoTotalContainer}>
        <View style={styles.freightInfoHalfContainer}>
          <Text style={styles.infoTitle}>배차 날짜:</Text>
          <Text style={styles.infoTitle}>운행 거리:</Text>
          <Text style={styles.infoTitle}>운행 운임:</Text>
          <Text style={styles.infoTitle}>상차지 주소:</Text>
          <Text style={styles.infoTitle}>하차지 주소:</Text>
          <Text style={styles.infoTitle}>화주 이름:</Text>
          <Text style={styles.infoTitle}>화주 연락처:</Text>
          <Text style={styles.infoTitle}>화물 설명:</Text>
        </View>
        <View style={styles.freightInfoHalfRightContainer}>
          <Text style={styles.infoRightTitle}>
            {item.startMonth}월 {item.startDay}일
          </Text>
          <Text style={styles.infoRightTitle}>{item.dist} KM</Text>
          <Text style={styles.infoRightTitle}>{item.expense} 원</Text>
          <TextTicker
            style={
              themeContext.theme == 'dark'
                ? {fontWeight: 'bold', fontSize: 18, margin: 2, color: 'white'}
                : {fontWeight: 'bold', fontSize: 18, margin: 2, color: 'black'}
            }
            duration={3000}
            loop
            bounce
            repeatSpacer={50}
            marqueeDelay={1000}>
            {item.startAddrFullArray[0]} {item.startAddrFullArray[1]}{' '}
            {item.startAddrFullArray[2]} {item.startAddrDetail}
          </TextTicker>
          <TextTicker
            style={
              themeContext.theme == 'dark'
                ? {fontWeight: 'bold', fontSize: 18, margin: 2, color: 'white'}
                : {fontWeight: 'bold', fontSize: 18, margin: 2, color: 'black'}
            }
            duration={3000}
            loop
            bounce
            repeatSpacer={50}
            marqueeDelay={1000}>
            {item.endAddrFullArray[0]} {item.endAddrFullArray[1]}{' '}
            {item.endAddrFullArray[2]} {item.endAddrDetail}
          </TextTicker>
          <Text style={styles.infoRightTitle}>{item.ownerName}</Text>
          <Text style={styles.infoRightTitle}>{item.ownerTel}</Text>
          <Text style={styles.infoRightTitle}>{item.desc}</Text>
        </View>
      </View>
      <Divider style={{backgroundColor: 'black'}} />
    </Layout>
  );

  const renderCallButton = () => {
    return (
      <Button
        onPress={() => {
          callOwner();
        }}
        style={styles.button}
        status="success"
        icon={phoneIcon}
        textStyle={styles.callButtonText}>
        화주 전화
      </Button>
    );
  };

  const renderNavButton = () => {
    var isDisable;
    if (lastState == '배송중') {
      isDisable = false;
    } else if (lastState == '배송완료') {
      isDisable = true;
    }
    return (
      <Button
        onPress={() => {
          navHandler();
        }}
        style={styles.button}
        textStyle={styles.buttonText}
        status="info"
        disabled={isDisable}
        icon={naviIcon}>
        내비 연결
      </Button>
    );
  };

  const renderCompleteButton = () => {
    var isDisable;

    if (lastState == '배송중') {
      isDisable = false;
    } else if (lastState == '배송완료') {
      isDisable = true;
    }
    return (
      <Button
        onPress={() => {
          completeHandler();
        }}
        style={styles.button}
        status="danger"
        icon={homeIcon}
        disabled={isDisable}
        textStyle={styles.buttonText}>
        운송 완료
      </Button>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView style={{flex: 0, backgroundColor: 'white'}} />
      <FlatList
        style={
          themeContext.theme == 'dark'
            ? {backgroundColor: '#222B45'}
            : {backgroundColor: '#FFFFFF'}
        }
        data={data}
        renderItem={_renderItem}
        keyExtractor={(item) => item.key}
      />
      <Layout style={styles.ButtonContainter}>
        <Layout style={styles.ButtonHalfContainer}>{renderNavButton()}</Layout>
        <Layout style={styles.ButtonHalfContainer}>{renderCallButton()}</Layout>
        <Layout style={styles.ButtonHalfContainer}>
          {renderCompleteButton()}
        </Layout>
      </Layout>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  Badge: {
    width: RFPercentage(14),
    height: RFPercentage(6),
    borderRadius: 8,
    margin: 5,
  },
  smallBadge: {
    width: RFPercentage(12),
    height: RFPercentage(2),
  },
  badgeText: {
    fontSize: RFPercentage(2),
  },
  button: {
    width: RFPercentage(15),
    height: RFPercentage(8),
    borderRadius: 8,
  },
  buttonText: {
    fontSize: RFPercentage(2),
    justifyContent: 'flex-start',
  },
  callButton: {
    width: RFPercentage(28),
    height: RFPercentage(8),
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: RFPercentage(2),
  },
  titleStyles: {
    paddingHorizontal: 20,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  Subtitle: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    lineHeight: 25,
  },
  freightContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    paddingVertical: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freightInfoTotalContainer: {
    paddingVertical: 10,
    flex: 1,
    flexDirection: 'row',
  },
  freightInfoHalfContainer: {
    flex: 1,
    paddingRight: 15,
    alignItems: 'flex-end',
  },
  freightInfoHalfRightContainer: {
    flex: 2,
    paddingLeft: 15,
    alignItems: 'flex-start',
  },
  geoContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  geoInfoContainer: {
    flex: 0.5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geoText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    lineHeight: 25,
  },
  geoSubText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    paddingVertical: 15,
    color: '#2F80ED',
  },
  geoSubText2: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    paddingVertical: 15,
    color: '#EB5757',
  },
  geoSubText3: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    paddingVertical: 15,
    color: '#9B51E0',
  },
  infoTitle: {
    paddingVertical: 4,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  infoRightTitle: {
    paddingVertical: 4,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  totalInfoContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    borderColor: '#20232a',
    marginTop: -30,
  },
  totalInfoHalfContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  ButtonContainter: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-between',
  },
  ButtonHalfContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconSize: {
    width: 32,
    height: 32,
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: 'black',
    margin: 10,
  },
});
