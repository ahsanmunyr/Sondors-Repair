import { View, ScrollView, SafeAreaView, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai';
import { getAuth } from 'firebase/auth';
import { getDocs, getFirestore, collection, doc } from "firebase/firestore";
import { Loader } from 'components/common/Loader';
import jobsAtom from 'atoms/jobsAtom';
import Text from 'components/common/Text';
import capitalizeFirstLetters from 'utilities/capitalizeFirstLetters';
import NewJobImage from 'assets/NewJobImage';
import Button from 'components/common/Button';
import HeaderRight from 'components/HeaderRight';
import { NavigationProp } from '@react-navigation/native';
import Colors from "styles/Colors";
import currentUserDataAtom from 'atoms/currentUserDataAtom'
import capitalizeFirstLetter from 'utilities/capitalizeFirstLetter';
import StarRating from "react-native-star-rating";
import Modal from "../common/Modal";
import moment from 'moment'
import {
  updateDoc,
  setDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

type Props = {
  jobDetails: JobDetails;
  onPress?: () => void
}
const statusStyle = (value: string) => {
  switch (capitalizeFirstLetter(value)) {
    case "Accepted":
      return {
        backgroundColor: '#ecfadc',
        color: 'green',
        paddingVertical: 4,
      };
      break;
    case "Completed":
      return {
        backgroundColor: Colors.darkAccent,
        color: Colors.dark,
        paddingVertical: 4,
      };
      break;
    case "Lead":
      return {
        backgroundColor: "#F5F8FF",
        color: Colors.primary,
        paddingVertical: 4,
      };
      break;
    case "Offer Rejected":
      return {
        backgroundColor: "#FFF5F7",
        color: Colors.errorText,
        paddingVertical: 4,
      };
      break;
    default:
      break;
  }
};
const JobView = ({ jobDetails, userApplied = null, jobID, onPress, navigation }: Props) => {

  const tailwind = useTailwind();
  const { imageUrl, title, bikeModel, type, description, } = jobDetails;
  const db = getFirestore()
  const [currentUserData] = useAtom(currentUserDataAtom)
  const dateAndTimeValue = new Date();
  const [loading, setLoading] = useState(false)
  const [data, onChangeData] = useState([])
  // const [isRatingModal, setIsRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const onStarRatingPress = (rating: number) => {
    setRating(rating);
  };
  var job = jobID?.trim();
  // console.log({job})
  if (jobID) {
    var jobRef = doc(db, "jobs", jobID);
  }
  if (jobID && userApplied !== null) {
    var jobRefUser = doc(db, "users", userApplied.uidP);
  }
  const completeTask = async () => {
    if (jobID && userApplied !== null) {
      await setDoc(
        jobRef,
        { data: [{ ...userApplied, jobResponseType: "completed" }] },
        { merge: true }
      );
      await updateDoc(doc(db, "jobs", job), {
        "jobDetails.jobStatus": 2,
        "jobDetails.createdAt": dateAndTimeValue.toString(),
      });

      getDocs(collection(db, "users"))
        .then(async (res) => {
          const users = res.docs.map((item) => {
            const data = item.data();
            return data;
          });
          const newObj = users.filter((item) => {
            return item.uid === userApplied.uidP;
          });
          // console.log(newObj, "+_+");

          await setDoc(
            jobRefUser,
            { totalJobs: newObj[0].totalJobs + 1, rating: newObj[0].rating + rating },
            { merge: true }
          );
        })
        .catch((e) => {
          console.log(e, "eeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        });

      // await data.getMyJob();
    }
    navigation.navigate("MyJobs")
  };


  const getJobs = async () => {
    setLoading(true)
    getDocs(collection(db, "jobs")).then((res) => {
      const jobsList = res.docs.map((item) => {
        const data = item.data()
        return data
      })
      const newObj = jobsList.filter((item) => {
        return item.id === jobDetails.id
      })
      let checkArray = []
      if (newObj.length > 0) {
        checkArray = newObj[0]?.data.filter((it: any, i: any) => {
          return it.uidP === currentUserData.uid
        })
      }
      if (checkArray.length > 0) {
        onChangeData(checkArray)
      }

      setLoading(false)
    }).catch((e) => {
      console.log(e, "eeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    })
  }

  useEffect(() => {
    setLoading(true)
    setRating(0)
    getJobs().then(() => {

    })

  }, [])

  if (loading) {
    return <Loader />
  }
  console.log(currentUserData.userType, "datadatadatadatadata")
  return (
    <>
      <ScrollView>
        <View >
          {/* Add Image for Job */}
          <Text left xxl style={{ fontWeight: 'bold', paddingHorizontal: 24, marginTop: 20, paddingBottom: 10 }}>Job Details</Text>
          {imageUrl ? (
            <View style={tailwind('w-full h-64 items-center justify-center')}>
              {console.log(imageUrl, "imageUrlimageUrlimageUrlimageUrl")}
              <Image
                style={tailwind(
                  "w-full h-64 items-center justify-center"
                )}
                source={{ uri: imageUrl }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={tailwind('w-full h-64 items-center justify-center bg-slate-100')}>
              <Text lg>No image</Text>
            </View>
          )}
          <ScrollView style={{ height: '60%' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
              <SafeAreaView style={[tailwind('flex grow px-6 py-3'), { width: '90%', alignSelf: 'center' }]}>
                {
                  currentUserData.userType == 'owner' &&
                    jobDetails.jobStatus == 1 ?
                    <View style={{ marginVertical: "1.5%" }}>
                      <StarRating
                        maxStars={5}
                        starSize={35}
                        // starStyle={{  marginLeft: "0.5%" }}
                        containerStyle={{ width: "70%" }}
                        rating={rating}
                        selectedStar={onStarRatingPress}
                        fullStarColor="#FCC736"
                      />
                    </View> : null
                }
                {
                  currentUserData.userType == 'owner' &&
                    jobDetails.jobStatus == 2 ?
                    <Text left sm tertiary style={tailwind('mt-1')}>You marked this job complete on {moment(jobDetails.createdAt).format("LL")}</Text> : null
                }
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', height: 200 }}>
                  <Text left xxl style={{ fontWeight: 'bold', marginTop: 10 }}>{title}</Text>
                  <View style={tailwind('mt-0')}>
                    <Text left tertiary style={tailwind('mt-2')}>Details</Text>
                    <Text left defaultColor style={tailwind('mt-0')}>{bikeModel.toUpperCase()}</Text>
                    <Text left defaultColor lineHeight={24}>{capitalizeFirstLetters(type)}</Text>
                  </View>
                  <View style={tailwind('mt-4')}>
                    <Text left tertiary>Description</Text>
                    <Text left lg numberOfLines={3}>{description}</Text>
                  </View>
                </View>
              </SafeAreaView>
                {console.log(jobDetails.jobStatus, "jobDetails.jobStatus")}
              {
                currentUserData.userType == 'provider' ?
                  <View style={{ width: '92%', alignSelf: 'center' }}>
                    {
                      data[0]?.jobResponseType == 'applied' && data[0]?.responseOnJob != 'rejected' && data.length > 0 ?
                        <View style={{
                          width: "100%", heigth: 100, borderRadius: 12, padding: 4, justifyContent: 'center', alignSelf: 'center'
                        }}>
                          <Button style={tailwind('rounded')} titleStyle={{ fontWeight: '700' }} lg title='Message' />
                          {/* <Text  xl style={{fontWeight: 'bold', color: 'white', textAlign:'center'}}>Applied</Text> */}
                        </View> :
                        data[0]?.jobResponseType == 'accepted' && data.length > 0 ?

                          <View style={{
                            width: 150, heigth: 100, backgroundColor: '#4285F4', borderRadius: 12, padding: 4, justifyContent: 'center', alignSelf: 'center'
                          }}>
                            <Text xl style={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Accepted</Text>
                          </View>
                          :
                          jobDetails.jobStatus == 2 && data.length > 0 ?

                            <View style={{
                              width: 150, heigth: 100, backgroundColor: '#2BBBAD', borderRadius: 12, padding: 4, justifyContent: 'center', alignSelf: 'center'
                            }}>
                              <Text xl style={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Completed</Text>
                            </View>

                            : jobDetails.jobStatus != 0 || data[0]?.responseOnJob == 'rejected' ?
                              <View style={{
                                width: "100%", heigth: 100, borderRadius: 12, padding: 4, justifyContent: 'center', alignSelf: 'center'
                              }}>
                                <Button style={[tailwind('rounded')]} titleStyle={{ fontWeight: '700' }} lg title='Offer Rejected' />

                              </View> :

                              <Button onPress={onPress} style={tailwind('rounded')} titleStyle={{ fontWeight: '700' }} lg title='Message' />
                    }

                  </View> : null
              }
            </View>
            {
            currentUserData.userType == 'owner' &&
              jobDetails.jobStatus == 1 ? <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 0, marginBottom: 10, height: 100 }}>
              <TouchableOpacity
                // onPress={onPress}
                style={{
                  backgroundColor: Colors.green,
                  width: "90%",
                  padding: "2.5%",
                  borderRadius: 5,
                }}
                onPress={() => {
                  completeTask()
                }}
              >
                <Text style={{ color: "white" }}>Mark Complete</Text>
              </TouchableOpacity>
            </View> : null
          }
          {
            currentUserData.userType == 'owner' &&
              jobDetails.jobStatus == 2 ? <View style={{ justifyContent: "center", alignContent: "center", alignItems: "center", marginTop: 0, marginBottom: 10 }}>
              <TouchableOpacity
                // onPress={onPress}
                style={{
                  backgroundColor: "lightgray",
                  width: "90%",
                  padding: "2.5%",
                  borderRadius: 5,
                }}
                onPress={() => {
                  navigation.navigate("MyJobs")
                }}
              >
                <Text style={{ color: "white" }}>Job Completed</Text>
              </TouchableOpacity>
            </View> : null
          }
          </ScrollView>
          {/* {console.log(currentUserData.userType == 'owner'? true : false)}
          {console.log(jobDetails.jobStatus == 1 ? true : false)} */}
 
        </View>
      </ScrollView>
      {/* Rating modal */}
      {/* {isRatingModal && (
                <Modal modalVisible={isRatingModal} setModalVisible={setIsRatingModal}>
                <Text>Rate this service provider.</Text>
                <View style={{height: 100, justifyContent:'center', alignItems:'center'}}>
                <StarRating
                    maxStars={5}
                    starSize={35}
                    // starStyle={{  marginLeft: ml }}
                    rating={rating}
                    selectedStar={onStarRatingPress}
                    fullStarColor="#FCC736"
                />
                </View>
                <View style={styles.btnContModal}>
                    <TouchableOpacity
                    onPress={() => setIsRatingModal(false)}
                    style={styles.btnNo}
                    >
                    <Text style={{ color: "white" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={completeTask} style={styles.btnYes}>
                    <Text style={{ color: "white" }}>Submit</Text>
                    </TouchableOpacity>
                </View>
                </Modal>
            )} */}
    </>
  );
}

// const styles = StyleSheet.create({
//     btnContModal: {
//         width: "100%",
//         justifyContent: "space-around",
//         flexDirection: "row",
//         marginTop: "3%",
//       },
//       btnYes: {
//         backgroundColor: "green",
//         width: "35%",
//         paddingVertical: "2%",
//         borderRadius: 5,
//       },
//       btnNo: {
//         backgroundColor: "red",
//         width: "35%",
//         paddingVertical: "2%",
//         borderRadius: 5,
//       },
//   });

export default JobView;
