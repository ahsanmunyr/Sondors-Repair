import React, { useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { NavigationProp, RouteProp } from "@react-navigation/native";

import JobView from "components/JobView";
import HeaderRight from "components/HeaderRight";

type Props = {
  route: RouteProp<JobsStackParamList, "CustomerJobDetailsScreen">;
  navigation: NavigationProp<JobsStackParamList, "CustomerJobDetailsScreen">;
};

const CustomerJobDetailsScreen = ({ route, navigation }: Props) => {
  const tailwind = useTailwind();
  const { jobDetails,userApplied,jobID } = route.params;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        jobDetails.streamChatId ? (
          jobDetails?.jobStatus !== 0 && <HeaderRight
            onPress={() =>
              navigation.navigate("JobChat", {
                externalId: userApplied.externalId,
                jobID: jobID,
                userApplied:userApplied
              })
            }
            title="View chat"
          />
        ) : null,
    });
  }, []);

  return (
    <SafeAreaView
      style={tailwind(
        "flex bg-white items-center justify-center h-full w-full"
      )}
    >
      <View style={tailwind("flex h-full justify-between w-full")}>
        <JobView
          onPress={() =>
            navigation.navigate("JobChat", {
              externalId: jobDetails.streamChatId!,
            })
          }
          jobDetails={jobDetails}
          userApplied={userApplied}
          jobID={jobID}
          navigation={navigation}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomerJobDetailsScreen;
