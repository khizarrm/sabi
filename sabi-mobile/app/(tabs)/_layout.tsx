import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { 
  name: React.ComponentProps<typeof FontAwesome>['name']; 
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{
      backgroundColor: props.focused ? Colors.light.primary : 'transparent',
      paddingHorizontal: props.focused ? 16 : 6,
      paddingVertical: props.focused ? 8 : 4,
      borderRadius: props.focused ? 20 : 12,
      minWidth: props.focused ? 60 : 32,
      height: props.focused ? 40 : 32,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <FontAwesome 
        size={24} 
        name={props.name}
        color={props.focused ? '#FFFFFF' : props.color} 
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.neutral400,
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.light.glass,
          backdropFilter: 'blur(20px)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.select({ ios: 96, default: 80 }),
          paddingBottom: Platform.select({ ios: 34, default: 16 }),
          paddingTop: 12,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: Colors.light.glassStroke,
          borderBottomWidth: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOpacity: 1,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: -8 },
          elevation: 30,
        },
      }}>
      {/* Activities - Left */}
      <Tabs.Screen
        name="two"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="list-ul" color={color} focused={focused} />,
          headerShown: false,
        }}
      />

      {/* Home - Middle */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
          headerShown: false,
        }}
      />

      {/* Profile - Right */}
      <Tabs.Screen
        name="three"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user" color={color} focused={focused} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
