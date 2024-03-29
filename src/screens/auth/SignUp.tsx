import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useState } from 'react';
import {TouchableOpacity,ScrollView} from "react-native"
import { useTailwind } from 'tailwind-rn';
import { View, Image, Dimensions, Alert } from 'react-native';
import Text from 'components/common/Text';
import TextInput from 'components/common/TextInput';
import Button from 'components/common/Button';
import Colors from 'styles/Colors';
import { NavigationProp } from '@react-navigation/native';
import SondorsLogoBlack from '../../assets/images/sondors-logo-black.png'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc, Timestamp } from 'firebase/firestore';

type Props = {
    navigation: NavigationProp<SignUpStackParamList, 'SignUp'>;
};

type OwnerAccountProps = {
}

type ProviderAccountProps = {
}

const Tab = createMaterialTopTabNavigator();

const OwnerAccount = ({ }: OwnerAccountProps) => {
    const tailwind = useTailwind();
    return (
        <View style={{ flex: 1, ...tailwind('flex items-center justify-center bg-white') }}>
            <Image style={{ height: 100, width: 100,}} resizeMode='cover' source={require('./../../assets/images/owner.png')} />
        </View>
    )
}

const ProviderAccount = ({ }: ProviderAccountProps) => {
    const tailwind = useTailwind();

    return (
        <View style={{ flex: 1, ...tailwind('flex items-center justify-center bg-white') }}>
                  <Image style={{ height: 150, width: 150,}} resizeMode='cover' source={require('./../../assets/images/sp.jpg')} />
        </View>
    )
}

const SignUp = ({ navigation }: Props) => {
    
    const auth = getAuth();
    const firestore = getFirestore();
    const tailwind = useTailwind();
    const { width } = Dimensions.get('window')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userType, setUserType] = useState('owner')
    const [loginType, setLoginType] = useState(false)

    const signUp = async () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const { email, uid } = userCredential.user
                setDoc(doc(firestore, "users", uid), {
                    username: name,
                    totalJobs: 0,
                    rating: 0,
                    distance: '',
                    email,
                    uid,
                    userType,
                    userProfileCompleted: false,
                    bikes:[],
                    createAt: Timestamp.now()
                });
              
            })
            .catch((error) => {
                const errorMessage = error.message;
                Alert.alert(errorMessage)
                if(errorMessage.includes("Firebase:")){
                    let a =  errorMessage.slice(10);
                      Alert.alert(a)
                    }
                    if(errorMessage.includes("firebase:")){
                      let a =  errorMessage.slice(10);
                      Alert.alert(a)
                    }
            });
    }

    return (
        <ScrollView style={{backgroundColor:'white'}}>
            <KeyboardAwareScrollView>
                    <View style={{ flex: 1, ...tailwind('bg-white') }}>
            <View style={{ ...tailwind('bg-white flex items-center px-6 pb-2 bg-white') }}>
                <View style={{ marginTop: 55 }} >
                    <Image resizeMode='cover' source={SondorsLogoBlack} style={{ resizeMode: 'contain', alignSelf: 'center', width: width * .7 }} />
                </View>
                <Text xxl title tertiary style={tailwind('mt-8')}>Let’s get started</Text>
                <Text xl title style={tailwind('mt-2')}>Are you a SONDORS owner or a service provider?</Text>
            </View>
            <Tab.Navigator
                style={{ height: 200 }}
                initialRouteName="Owner"
                screenOptions={
                    {
                        tabBarLabelStyle: { fontSize: 16, textTransform: 'none' },
                        tabBarStyle: {
                            shadowColor: Colors.shadow,
                            elevation: 2,
                        },
                        tabBarInactiveTintColor: Colors.tertiaryText,
                        tabBarActiveTintColor: Colors.titleText,
                        tabBarBounces: false,
                        tabBarIndicatorStyle: {
                            backgroundColor: Colors.primaryRed
                        }
                    }
                }
            >
             
                <Tab.Screen
                    listeners={{
                        tabPress: () => {
                            setUserType('owner')
                            
                        },
                    }}
                    name="Owner" component={() => <OwnerAccount />} />
                <Tab.Screen
                    name="Service Provider"
                    component={() => <ProviderAccount />}
                    listeners={{
                        tabPress: () => {
                            setUserType('provider')
                        },
                    }}
                />
            </Tab.Navigator>

            <View style={[tailwind('w-full px-6')]}>
            <TextInput value={name} lg placeholder='Name' onChangeText={(text) => setName(text)} />
                <TextInput lg placeholder='Email' style={tailwind('mt-3')} onChangeText={(text) => setEmail(text)} />
                <TextInput secureTextEntry style={tailwind('mt-3')} lg placeholder='Password' onChangeText={(text) => setPassword(text)} />
                <Button onPress={signUp} style={tailwind('mt-3 rounded')} titleStyle={{ fontWeight: '700' }} lg title='Create account' />
                <Text title md style={{ ...tailwind('mt-2') }}>By creating an account I agree to the</Text>
                <Text md style={{ color: Colors.primary }}>Terms & Conditions</Text>
             
                <TouchableOpacity  onPress={() => {
                    navigation.navigate("SignIn")
                }}>
                    <Text md style={{ ...tailwind('my-6') }} sm tertiary>I already have an account — <Text title>sign in</Text> </Text>
                </TouchableOpacity>
               
            </View>
        </View>
        </KeyboardAwareScrollView>
        </ScrollView>
    );
}

export default SignUp