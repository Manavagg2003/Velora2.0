import { Tabs } from 'expo-router';
import { Home, ChefHat, MessageCircle, User, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const { theme } = useTheme();

  const TabIcon = ({ 
    Icon, 
    focused, 
    size = 24, 
    label 
  }: { 
    Icon: any; 
    focused: boolean; 
    size?: number; 
    label: string; 
  }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
      {focused ? (
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
          }}
        >
          <Icon size={size} color={theme.textInverse} />
        </LinearGradient>
      ) : (
        <View style={{ 
          width: 40, 
          height: 40, 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 2,
        }}>
          <Icon size={size} color={theme.textSecondary} />
        </View>
      )}
      <Text style={{
        fontSize: 10,
        fontWeight: focused ? '600' : '400',
        color: focused ? theme.primary : theme.textSecondary,
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 70,
          paddingTop: 6,
          paddingBottom: 10,
          paddingHorizontal: 16,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon 
              Icon={Home} 
              focused={focused} 
              size={size} 
              label="Home" 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon 
              Icon={ChefHat} 
              focused={focused} 
              size={size} 
              label="Recipes" 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="generate-recipe"
        options={{
          title: 'Generate',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon 
              Icon={Sparkles} 
              focused={focused} 
              size={size} 
              label="Generate" 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon 
              Icon={MessageCircle} 
              focused={focused} 
              size={size} 
              label="AI Chat" 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon 
              Icon={User} 
              focused={focused} 
              size={size} 
              label="Profile" 
            />
          ),
        }}
      />
    </Tabs>
  );
}
