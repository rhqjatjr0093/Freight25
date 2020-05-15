import React, {useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Text,
  StyleSheet,
  View,
  Linking,
  Platform,
  SafeAreaView,
  FlatList,
  FlatListProps,
  ScrollView,
} from 'react-native';
import {
  LayoutElement,
  Icon,
  Divider,
  Button,
} from '@ui-kitten/components';
import MapView, {PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import { DetailScreenProps } from '../../navigation/search.navigator';
import { AppRoute } from '../../navigation/app-routes';
import { TouchableOpacity, TouchableHighlight } from 'react-native-gesture-handler';

const isAndroid = Platform.OS ==='android';



export class DetailScreen extends React.Component <DetailScreenProps> {
  
  

  constructor(props) {
    super(props);
    

    this.state = {
      data : [
        {
          id: '1',
          startX: '127.370187',
          startY: '36.334634',
          finishX: '127.043625',
          finishY: '37.280209',
          startAddress: '청주 상당',
          finishAddress: '수원 영통',
          startType: '당상',
          finishType: '당착'
        },
        {
          id: '2',
          startX: '127.370187',
          startY: '36.334634',
          finishX: '127.043625',
          finishY: '37.280209',
          startAddress: '천안 ',
          finishAddress: '수원 영통',
          startType: '당상',
          finishType: '당착'
        },
        {
          id: '3',
          startX: '127.370187',
          startY: '36.334634',
          finishX: '127.043625',
          finishY: '37.280209',
        }
      ],
      apiInfo: [],
      mapVisible: true,
      stopoverVisible : true,
      FreightID: null,
    };

    
  };

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('FreightID');
      if (value !== null) {
        this.setState({FreightID: value})
        console.log(this.state.FreightID);



      }
    } catch (error) {

    }
  };
  

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem('FreightID');
      if (value !== null) {
        this.setState({FreightID: value})        
      }
    } catch (error){}

    // 이 시점부터 this.state.FreightID로 화물 ID에 접근이 가능합니다 바로 사용하시면 됩니다.


    /*const that = this;
    var data = fetch( "https://apis.openapi.sk.com/tmap/truck/routes?version=1&format=json&callback=result", {
      method: 'POST',
      headers:{
        "appKey" : "l7xxce3558ee38884b2da0da786de609a5be",
      },
      body: JSON.stringify({
        "startX" : "126.769129",
        "startY" : "37.698591", 
        "endX" : "129.042082",
        "endY" : "35.115199",
        "reqCoordType" : "WGS84GEO",
        "resCoordType" : "WGS84GEO",
        "angle" : "172",
        "searchOption" : '1',
        "passlist" : ``, //경유지 정보 (5개까지 추가 가능이므로 고려 할 것)
        "trafficInfo" : "Y",
        "truckType" : "1",
        "truckWidth" : "100",
        "truckHeight" : "100",
        "truckWeight" : "35000",  // 트럭 무게를 의미하기 때문에 값을 불러오는것이 좋을 듯
        "truckTotalWeight" : "35000", // 화물 무게도 불러올 것
        "truckLength" : "200",  // 길이 및 높이는 일반적인 트럭 (2.5톤 트럭의 크기 등) 을 따를 것        
      })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonData) {
      var coordinates = [];
      for(let i=0; i<Object(jsonData.features).length; i++){
        if(typeof jsonData.features[i].geometry.coordinates[0] === 'object'){
          for(let j=0; j<Object(jsonData.features[i].geometry.coordinates).length; j++){
            coordinates.push({latitude: Number(jsonData.features[i].geometry.coordinates[j][1]), longitude: Number(jsonData.features[i].geometry.coordinates[j][0])});
          }
        } else{
          if(jsonData.features[i].geometry.coordinates != null){
            coordinates.push({latitude: Number(jsonData.features[i].geometry.coordinates[1]), longitude: Number(jsonData.features[i].geometry.coordinates[0])});
          }           
        }      
      }
      that.setState({ apiInfo: coordinates });
      console.log(that.state.apiInfo);
      return JSON.stringify(jsonData);
    });*/

    
  };
  
  hideMap = () => {
    if(this.state.mapVisible){
      this.setState({mapVisible: false})
    } else{
      this.setState({mapVisible: true})
    }
  };

  hideStopvoer = () => {
    if(this.state.stopoverVisible){
      this.setState({stopoverVisible: false})
    } else{
      this.setState({stopoverVisible: true})
    }
  }
  
  renderItem = ({item}) => (   
      <View style={{height: 25, flexDirection: 'row'}}>
      <View style={{flex:3, flexDirection: 'row'}}>
        <View style={{flex:5, flexDirection: 'row'}}>
          <View style={{flex: 2}}><Text style={{textAlign: 'center',fontWeight: 'bold'}}>충남 천안</Text></View>
          <View style={{flex: 1}}><Text style={{fontWeight: 'bold', color: '#2F80ED'}}>당상</Text></View>
        </View>
        <View style={{flex:1}}><Icon style={styles.icon2} fill='black' name='arrow-forward-outline'/></View>
        <View style={{flex:5, flexDirection: 'row'}}>
          <View style={{flex: 2}}><Text style={{textAlign: 'center',fontWeight: 'bold'}}>서울 송파</Text></View>
          <View style={{flex: 1}}><Text style={{fontWeight: 'bold', color: '#EB5757'}}>당착</Text></View>
        </View>
      </View>
      <View style={{flex:1}}><Text style={{fontWeight: 'bold'}}>120,000원</Text></View>
    </View>
  );

  render(){
     return (       
      <React.Fragment>
        <View style={{height: 80, backgroundColor: 'white'}}>
          <Text style={styles.Title}>  배차 정보</Text>
          <View style={styles.MainInfo}>
            <View style={styles.MainInfoGeo}>
              <Text style={styles.geoText}>대전 서구</Text>
              <Text style={styles.startType}>  당상</Text>
            </View>
            <View style={styles.MainInfoIcon}>
              <Icon style={styles.icon} fill='black' name='arrow-forward-outline'/>
              <Text style={styles.Type}>혼적</Text>
            </View>            
            <View style={styles.MainInfoGeo2}>
              <Text style={styles.endType}>당착  </Text>
              <Text style={styles.geoText}>서울 성북</Text>              
            </View>
          </View>
          <Divider style={{backgroundColor: 'black'}}/>
        </View> 

                  
        <TouchableOpacity onPress={this.hideMap}>
          <View style={{backgroundColor: 'white'}}>
            <Text style={styles.Title}>  배차 정보 (Tmap)</Text>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>              
        </TouchableOpacity>
        {this.state.mapVisible ? (
          <View style={{height: 200, backgroundColor: 'white'}}>            
              <MapView style={{flex: 1}} provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 35.115199,
                longitude: 129.042082,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}>
              <Polyline
                coordinates={this.state.apiInfo}
                strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                strokeColors={[
                  '#7F0000',
                  '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                  '#B24112',
                  '#E5845C',
                  '#238C23',
                  '#7F0000'
                ]}
                strokeWidth={6}
              />
            </MapView>              
          <Divider style={{backgroundColor: 'black'}}/>                                 
        </View>
        ) : null}

        <TouchableOpacity onPress={this.hideStopvoer}>
          <View style={{backgroundColor: 'white'}}>
            <Text style={styles.Title}>  경유지 정보</Text>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>              
        </TouchableOpacity>                
        {this.state.stopoverVisible ? (
        <View style={{backgroundColor: 'white'}}>         
          <FlatList 
            style={{backgroundColor : 'white'}}              
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
          />
          <Divider style={{backgroundColor: 'black'}}/>
        </View>
        ) : null}


        <ScrollView>
          <View style={{backgroundColor: 'white'}}>          
            <Text style={styles.Title}>  화물 상세 정보</Text>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3, alignItems:'flex-end'}}><Text style={styles.freightTitle}>운행거리 / 운임 : </Text></View>
              <View style={{flex:5, alignItems:'center'}}><Text style={styles.freightTitle}>187.9Km / 1079원</Text></View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3, alignItems:'flex-end'}}><Text style={styles.freightTitle}>화물정보 및 적재 : </Text></View>
              <View style={{flex:5, alignItems:'center'}}><Text style={styles.freightTitle}>6톤 / 6파렛 / 지게차</Text></View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3, alignItems:'flex-end'}}><Text style={styles.freightTitle}>상차지 주소 : </Text></View>
              <View style={{flex:5, alignItems:'center'}}><Text style={styles.freightTitle}>대전광역시 서구 내동 27-3</Text></View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3, alignItems:'flex-end'}}><Text style={styles.freightTitle}>하차지 주소 : </Text></View>
              <View style={{flex:5, alignItems:'center'}}><Text style={styles.freightTitle}>서울특별시 성북구 정릉동 11-7</Text></View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3, alignItems:'flex-end'}}><Text style={styles.freightTitle}>특이사항 : </Text></View>
              <View style={{flex:5, alignItems:'center'}}><Text style={styles.freightTitle}>하차대기 없습니다</Text></View>
            </View>
            <Divider style={{backgroundColor: 'black'}}/>
          </View>   
        </ScrollView>

        <Divider style={{backgroundColor: 'black'}}/>
        <View style={{backgroundColor: 'white', flexDirection: 'row'}}>          
          <View style={{flex:3}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, margin: 5}}>  스마트 확률</Text>
            <View style={{alignItems: 'flex-end', justifyContent: 'flex-start'}}>
              <Text style={{margin:2, fontSize: 14, fontWeight: 'bold', color: '#BDBDBD'}}>   하차지 서울 성북에서 화물이 있을 확률 </Text>
            </View>            
          </View>       
          <View style={{flex:1, alignItems:'center', justifyContent:'flex-end'}}><Text style={{fontSize: 26, fontWeight: 'bold'}}>87%</Text></View>
          <Divider style={{backgroundColor: 'black'}}/>
        </View>

        <Divider style={{backgroundColor: 'black'}}/>
        <View style={{backgroundColor: 'white', flexDirection: 'row'}}>          
          <View style={{flex:5, justifyContent: 'center'}}>
            <Text style={styles.freightTitle}>      총 운행거리 : 250km </Text>
            <Text style={styles.freightTitle}>      총 운행운임 : 200,000원 </Text>
          </View>
          <View style={{flex:2, alignItems: 'center', justifyContent: 'center'}}>
            <Button style={styles.button} status='success'>수 락</Button>
          </View>
        </View>      
      </React.Fragment>      
    );
  };  
};

const styles = StyleSheet.create({
  Title:{
    fontWeight: 'bold',
    fontSize: 16,   
    margin: 5,
  },
  MainInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  MainInfoGeo: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex : 2,
    flexDirection: 'row'
  },
  MainInfoGeo2: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex : 2,
    flexDirection: 'row'
  },
  MainInfoType: {
    justifyContent: 'center',
    alignItems: 'center',
    flex : 2,
  },
  MainInfoIcon: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex : 1,    
  },
  MainInfoType2: {
    justifyContent: 'center',
    alignItems: 'center',
    flex : 1,    
  },
  geoText:{
    textAlign: 'center', 
    fontWeight: 'bold',
    fontSize: 24,    
  },
  icon: {
    width: 32,
    height: 24,
  },
  icon2:{
    justifyContent: 'center',
    width: 20,
    height: 15,
  },
  startType: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2F80ED'
  },
  Type:{
    fontWeight: 'bold',
    fontSize: 14,
    color: '#9B51E0'
  },
  endType: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#EB5757'
  },
  freightTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: 5
  },
  button:{
    margin: 5
  }
});