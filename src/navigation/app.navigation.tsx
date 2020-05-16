import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthNavigator} from './auth.navigator';
import {HomeNavigator} from './home.navigator';
import {OwnerNavigator} from './owner.navigator';
import {
  CheckNavigator,
  CheckDetailDriverNavigator,
  CheckDetailOwnerNavigator,
} from './check.navigator';
import {SearchNavigator, SearchDetailNavigator} from './search.navigator';
import {ApplyNavigator} from './apply.navigator';
import {AppRoute} from './app-routes';
import {ProfileNavigator} from './profile.navigator';
import {SignupNavigator} from './signup.navigator';

const Stack = createStackNavigator();

export const AppNavigator = (props): React.ReactElement => (
  <Stack.Navigator {...props} headerMode="none">
    <Stack.Screen name={AppRoute.AUTH} component={AuthNavigator} />
    <Stack.Screen name={AppRoute.SIGNUP} component={SignupNavigator} />
    <Stack.Screen name={AppRoute.HOME} component={HomeNavigator} />
    <Stack.Screen name={AppRoute.OWNER} component={OwnerNavigator} />
    <Stack.Screen name={AppRoute.SEARCH} component={SearchNavigator} />
    <Stack.Screen
      name={AppRoute.SEARCH_DETAIL}
      component={SearchDetailNavigator}
    />
    <Stack.Screen name={AppRoute.CHECK} component={CheckNavigator} />
    <Stack.Screen
      name={AppRoute.CHECK_DETAIL_OWNER}
      component={CheckDetailOwnerNavigator}
    />
    <Stack.Screen
      name={AppRoute.CHECK_DETAIL_DRIVER}
      component={CheckDetailDriverNavigator}
    />
    <Stack.Screen name={AppRoute.APPLY} component={ApplyNavigator} />
    <Stack.Screen name={AppRoute.PROFILE} component={ProfileNavigator} />
  </Stack.Navigator>
);
