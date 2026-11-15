import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext.js';
import { Cargando } from './src/components/ui.js';
import LoginScreen from './src/screens/LoginScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import PrediosScreen from './src/screens/PrediosScreen.js';
import PredioFormScreen from './src/screens/PredioFormScreen.js';
import CosechasScreen from './src/screens/CosechasScreen.js';
import CosechaFormScreen from './src/screens/CosechaFormScreen.js';
import CosechaDetailScreen from './src/screens/CosechaDetailScreen.js';
import { colors } from './src/theme/colors.js';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.verde900 },
  headerTintColor: '#ffffff',
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.fondo },
};

function Navegacion() {
  const { user, cargando } = useAuth();
  if (cargando) return <Cargando texto="Iniciando..." />;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'BosqueSur Terreno' }} />
          <Stack.Screen name="Predios" component={PrediosScreen} options={{ title: 'Predios' }} />
          <Stack.Screen name="PredioForm" component={PredioFormScreen} options={{ title: 'Nuevo predio' }} />
          <Stack.Screen name="Cosechas" component={CosechasScreen} options={{ title: 'Cosechas' }} />
          <Stack.Screen name="CosechaForm" component={CosechaFormScreen} options={{ title: 'Nueva cosecha' }} />
          <Stack.Screen name="CosechaDetail" component={CosechaDetailScreen} options={{ title: 'Detalle de cosecha' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Navegacion />
      </NavigationContainer>
    </AuthProvider>
  );
}
