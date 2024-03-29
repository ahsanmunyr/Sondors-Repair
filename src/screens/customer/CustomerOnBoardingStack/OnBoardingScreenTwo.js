import React, { useEffect, useState } from "react";
import { SafeAreaView, View ,Text, TouchableOpacity, Image,Dimensions, ActivityIndicator} from "react-native";
import { useTailwind } from "tailwind-rn";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import HeaderRight from "components/HeaderRight";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import currentUserDataAtom from "atoms/currentUserDataAtom";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import uuid from "react-native-uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import customerDetailsAtom from "atoms/customerDetailsAtom";
import { useAtom } from "jotai";
import PickerSelect from "components/common/PickerSelect";
import bikeModelsAtom from "atoms/bikeModelsAtom";
import Colors from "styles/Colors";


const { height, width } = Dimensions.get("window");
const itemWidth = (width - 15) / 2;

const OnBoardingScreenTwo = ({ navigation }) => {
  const tailwind = useTailwind();

  const [customerDetails, setCustomerDetails] = useAtom(customerDetailsAtom);
  const [updatedModel, setUpdatedModel] = useState("");
  const [updatedDateAdded, setUpdatedDateAdded] = useState("");
  const [updatedImage, setUpdatedImage] = useState("");
  const [loader, setLoader] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [bikeModels] = useAtom(bikeModelsAtom);
  const dateAndTimeValue = new Date();
  const [currentUserData, setCurrentUserData] = useAtom(currentUserDataAtom);
  
  const [imageUploaded, setImageUploaded] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageUrlFireStore, setImageUrlFireStore] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  const updateCustomerDetails = async (imgUrl) => {
   
    const newBike = {
      id: uuid.v4(),
      model: updatedModel,
      dateAdded: updatedDateAdded.toString(),
      image: imgUrl,
    };
    console.log({newBike})
    if (updatedModel != "" || updatedDateAdded != "") {
      var jobRef = doc(db, "users", currentUserData?.uid);

      await setDoc(
        jobRef,
        { ...currentUserData, bikes: [...customerDetails.bikes, newBike] },
        { merge: true }
      );
      setCustomerDetails({
        ...customerDetails,
        bikes: [...customerDetails.bikes, newBike],
      });
      alert("Successfully updated")
      // navigation.goBack();
    } else {
      alert("Something Wrong");
    }
  };

  async function uploadImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
  

    if (!result.cancelled) {
      const uploadUrl = await uploadImageAsync(result.uri);
      setImageUrl(uploadUrl);
      setImage(result.uri);
    }
    setImageUploaded(true);
  }

  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    return blob;
  }


  const onCreateNewJob = async () => {
    setLoader(true)
    const timespamp = Date.now();

    const metadata = {
      contentType: "image/jpeg",
    };
    const storage = getStorage();
    const storageRef = ref(storage, `Bike-Create-Image/${timespamp}`);


    uploadBytes(storageRef, imageUrl, metadata).then((snapshot) => {
      const jobsRef = collection(db, "jobs");
      getDownloadURL(snapshot.ref).then( async (downloadURL) => {
        console.log("File available at");
        setImageUrlFireStore(downloadURL);
        const URL = downloadURL
        // const jobId = uuid.v4();
        // const { currentUser } = auth;
        updateCustomerDetails(URL)
        setLoader(false)
        // navigation.goBack();
    });
  }).catch((err)=>{
    setLoader(false)
  })
  }
  


  return (
    <SafeAreaView
      style={tailwind(
        "flex bg-white items-center justify-center h-full w-full"
      )}
    >
      <View style={{justifyContent:'space-around', width: '100%', height: 500}}>
        <Text style={{textAlign:'center', fontSize:20}}>Your Garage</Text>
        <View style={{height: 450, width: '100%', justifyContent:"center", alignItems:'center',}}>
        { 
        image == null ?
        <TouchableOpacity 
             
              onPress={()=>{uploadImage()}} >
        <LinearGradient
    // Background Linear Gradient
          colors={['#f0f0f0', '#fafcff']}
          style={{
            backgroundColor: "#ddd",
              // minWidth:  itemWidth  ,
              // maxWidth:  itemWidth ,
              height: 180,
              width: 350,
              borderRadius:12,
              // margin: 5,
              justifyContent:'center'
          }}
          >
            <Text placeholder lg style={{ textAlign:'center', justifyContent:'center'}}>
              Upload Image
            </Text>
          </LinearGradient>
          </TouchableOpacity>
           :
          <TouchableOpacity onPress={()=>{uploadImage()}}>
          <Image source={{uri:image}} resizeMode='cover' style={{
                    height: 180,
              width: 350,
              borderRadius:12,
              backgroundColor:'white'
          }} />
          </TouchableOpacity>}
          <View style={[tailwind("pt-4 px-5 w-full")]}>
     
            <Text left bold tertiary style={tailwind("mt-3")}>
              Model
            </Text>
            <PickerSelect
              // style={tailwind("mt-3")}
              items={bikeModels}
              value={updatedModel}
              onValueChange={(text) => {
                // console.log(text, "SADADSAD");
                setUpdatedModel(text);
              }}
              placeholder="Bike Model"
            />
            <Text left bold tertiary style={tailwind("mt-3")}>
              Year Purchased
            </Text>
            <TouchableOpacity
              style={[
                // tailwind("mt-3"),
                {
                  // backgroundColor:"red",
                  width: "100%",
                  paddingVertical: "4%",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  paddingLeft: 8,
                  borderWidth: 1,
                  // borderColor: "#e6e6e6",
                },
              ]}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <Text style={{ color: "gray" }}>
                {updatedDateAdded === ""
                  ? "What month and year was your bike purchased?"
                  : moment(updatedDateAdded).format("YYYY")}
              </Text>
            </TouchableOpacity>
            {/* <TextInput 
                            style={tailwind('mt-3')} 
                            value={updatedDateAdded} 
                            onChangeText={(text: string) => setUpdatedDateAdded(text)} 
                            placeholder="What month and year was your bike purchased?" 
                        /> */}
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(data) => {
              setUpdatedDateAdded(data);
              setIsDatePickerVisible(false);
            }}
            onCancel={() => setIsDatePickerVisible(false)}
          />
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              width: "90%",
              marginTop: "3%",
              paddingVertical: "3%",
              justifyContent:"center",
              alignItems:"center"
            }}
            disabled={loader}
            onPress={onCreateNewJob}
          >
            {
              loader ? 
              <View style={{justifyContent:'center', alignItems:'center'}}>
              <ActivityIndicator size={20} color={'white'} />
              </View>: <Text style={{color:"white"}}>Save</Text>
            }
           
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{justifyContent:'center', alignItems:'center'}} onPress={()=>{
          setImageUploaded(false)
          setImage(null)
          setImageUrl(null)
          setUpdatedModel("")
          setUpdatedDateAdded("")     
        }}>
          <Text  style={{textAlign:'center', fontSize:15, color: 'blue'}}>Add more SONDORS</Text>
          </TouchableOpacity>
      </View>
      <View style={{position:'absolute', bottom: 20,width: "96%",}}>
            <View style={{  width: "96%", heigth: 200,  borderRadius: 12, justifyContent:'center', alignSelf:'center', backgroundColor:'#395AE0' }}>
                   <TouchableOpacity style={{width: "96%", heigth: 200,}} onPress={()=> navigation.navigate('OnBoardingScreenThree')}>
                            <Text style={{color: 'white',fontWeight: '700', textAlign:"center", padding: 20, fontSize:17}}> Continue</Text>
                   </TouchableOpacity> 
            </View>
      </View>
    </SafeAreaView>
  );
};

export default OnBoardingScreenTwo;
