import axios from 'axios';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {
  useFonts,
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import Ionicons from "react-native-vector-icons/Ionicons";
import { color } from 'react-native-elements/dist/helpers';
import { GetDistance } from './function'


export default function RoutePlanner() {

  const originId = useRef(null);
  const destId = useRef(null);
  const originName = useRef(null);
  const destName = useRef(null);

  const [carTime, setCarTime] = useState(0);  // Moved to state
  const [busTime, setBusTime] = useState(0);
  const [bicycleTime, setBicycleTime] = useState(0);
  const [walkTime, setWalkTime] = useState(0);

  const [carTimeValue, setCarTimeValue] = useState(0);  // Moved to state
  const [busTimeValue, setBusTimeValue] = useState(0);
  const [bicycleTimeValue, setBicycleTimeValue] = useState(0);
  const [walkTimeValue, setWalkTimeValue] = useState(0);

  const [carDistance, setCarDistance] = useState(0);  // Moved to state
  const [busDistance, setBusDistance] = useState(0);
  const [bicycleDistance, setBicycleDistance] = useState(0);
  const [walkDistance, setwalkDistance] = useState(0);

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const GOOGLE_PLACES_API_KEY = 'AIzaSyAygHKhIwi1_vM_V_qBl3RB-L_31GnBkG4';
  const [selectedOption, setSelectedOption] = useState(null);
  let [fontsLoaded] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  if (!fontsLoaded) {
    return null;
  }
  const transportData = [
    { mode: 'car', time: carTime, co2: (carDistance * 0.1151).toFixed(1) + 'g CO2', calories: '0 calories' },
    { mode: 'bus', time: busTime, co2: (busDistance * 0.05).toFixed(1) + 'g CO2', calories: '0 calories' },
    { mode: 'bicycle', time: (walkTimeValue / 4.5 / 60 === 0) ? '0' : (walkTimeValue / 4.5 / 60).toFixed(1) + " mins", co2: '0g CO2', calories: (walkTimeValue / 4.5 / 60 * 8).toFixed(1) + ' calories' },
    { mode: 'walk', time: walkTime, co2: '0g CO2', calories: (walkTimeValue / 60 * 4).toFixed(1) + ' calories' },
  ];

  const handleOptionPress = (mode) => {
    setSelectedOption(mode);
  };
  const handleMapPress = () => {
    if (destId.current == null || originId.current == null || selectedOption == null) {
      throw new Error('fields are empty');
    }


    let mode = null;
    switch (selectedOption) { // set time
      case 'car':
        console.log("drive");
        mode = 'driving';
        break;
      case 'bus':
        console.log("bus");  // bus
        mode = 'transit';
        break;
      case 'bicycle':
        console.log("cycle");
        //nu merge cu bicicelta in anumite zone
        mode = 'walking';
        break;
      case 'walk':
        console.log("walk");
        mode = 'walking';
        break;
      default:
        console.error('Error', selectedOption, "does not exist");
        break;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originName.current}&destination=${destName.current}&destination_place_id=${destId.current}&travelmode=${mode}`;

    Linking.openURL(url).catch(err => console.error("Failed to open URL", err));
  };

  const calculateDistance = () => {
    const getDistanceInfo = async (mode) => {
      try {
        const data = await GetDistance(originId.current, destId.current, mode);
        switch (mode) { // set time
          case 'driving':
            setCarTime(data.rows[0].elements[0].duration.text);
            setCarTimeValue(data.rows[0].elements[0].duration.value);
            setCarDistance(data.rows[0].elements[0].distance.value);
            break;
          case 'transit':
            setBusTime(data.rows[0].elements[0].duration.text);  // bus 
            setBusTimeValue(data.rows[0].elements[0].duration.value);
            setBusDistance(data.rows[0].elements[0].distance.value);
            break;
          case 'bicycling':
            setBicycleTime(data.rows[0].elements[0].duration.text);
            break;
          case 'walking':
            setWalkTime(data.rows[0].elements[0].duration.text);
            setWalkTimeValue(data.rows[0].elements[0].duration.value);
            break;
          default:
            console.error('Unknown mode:', mode);
            break;
        }

        /*console.log('Data:', JSON.stringify(data, null, 2));
        console.log('Distance:', data.rows[0].elements[0].distance.text);
        console.log('Duration:', data.rows[0].elements[0].duration.text);*/
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    getDistanceInfo('driving');
    getDistanceInfo('transit');//bus
    //getDistanceInfo('bicycling');
    getDistanceInfo('walking');

  };

  return (

    <ImageBackground source={require('./assets/star_background.jpg')} style={styles.background}>
      <SafeAreaView style={styles.safeView}>

        <View style={styles.container}>
          <TouchableOpacity style={styles.menuIcon}>
            <Icon name="menu" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Route Planner</Text>


        <GooglePlacesAutocomplete
          placeholder='Where are you?'
          fetchDetails={true}
          onPress={(data, details = null) => {
            const { lat, lng } = details.geometry.location;
            //console.log('Details:', JSON.stringify(details, null, 4));
            console.log(details.place_id);
            originId.current = details.place_id;
            originName.current = details.formatted_address;
            console.log(originName.current);
            if (destId.current != null) {
              calculateDistance();
            }
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: 'en',
          }}
          styles={{
            textInput: styles.inputLoc,
            listView: {
              position: 'absolute',  // Absolute positioning
              top: "78%",  // Adjust this to position dropdown
              left: 0,
              right: 0,
              zIndex: 100,  // Ensure the dropdown is on top
              backgroundColor: 'white',
              borderRadius: 10,  // Rounded corners
              borderColor: "#D3D3D3",
              borderWidth: 4,
              marginLeft: "5%",
              marginRight: "5%"
            },
            row: {
              height: 50,
            },
            separator: {
              height: 0,
              backgroundColor: 'black',
              borderWidth: 0,
              borderColor: "#D3D3D3"
            },
          }}

        />

        <GooglePlacesAutocomplete
          placeholder='Where do you wanna go?'
          fetchDetails={true}
          onPress={(data, details = null) => {
            const { lat, lng } = details.geometry.location;
            console.log(details.place_id);
            destId.current = details.place_id;
            destName.current = details.formatted_address;

            console.log("Other is null");
            if (originId.current != null) {
              calculateDistance();
            }
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: 'en',
          }}
          styles={{
            textInput: styles.inputDest,
            listView: {
              position: 'absolute',
              top: "-22%",  // Adjust this to position dropdown
              left: 0,
              right: 0,
              zIndex: 1000,  // Ensure the dropdown is on top
              backgroundColor: 'white',
              borderRadius: 10,
              borderRadius: 10,  // Rounded corners
              borderColor: "#D3D3D3",
              borderWidth: 4,
              marginLeft: "5%",
              marginRight: "5%"
            },
            row: {
              height: 50,
            },
            separator: {
              height: 0,
              backgroundColor: 'black',
              borderWidth: 0,
              borderColor: "#D3D3D3"
            },
          }}
        />

        <Text style={styles.question}>How will you get there?</Text>

        <View style={styles.transportOptions}>
          {transportData.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedOption === option.mode && styles.selectedOption, // Apply selected styles
              ]}
              onPress={() => handleOptionPress(option.mode)}
              activeOpacity={1} // Set to 1 to disable fade effect
            >
              {/* Icon with White Square */}
              <View style={styles.iconWrapper}>
                <Icon
                  name={
                    option.mode === 'bus'
                      ? 'bus'
                      : option.mode === 'car'
                        ? 'car'
                        : option.mode === 'bicycle'
                          ? 'bicycle'
                          : 'walk'
                  }
                  size={30}
                  color="#001540"
                />
              </View>

              {/* Details */}
              <View style={styles.optionDetails}>
                <Text style={styles.optionText}>{option.time}</Text>
                <Text style={styles.optionSubText}>{option.co2}</Text>
                <Text style={styles.optionSubText}>{option.calories}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Go to Google Maps Button */}
        <TouchableOpacity style={styles.goToMapsButton} onPress={handleMapPress}>
          <Text style={styles.goToMapsText}>Go to Google Maps
            <Ionicons name="location-outline" size={25} style={styles.icon} />

          </Text>
        </TouchableOpacity>


      </SafeAreaView>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover"
  },
  menuIcon: {
    alignSelf: "flex-start",
    marginTop: '20%',
    marginLeft: '5%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontFamily: "Fredoka_600SemiBold",
    marginTop: "5%",
    color: "white",
    //marginRight:"30%",
    //marginLeft:"30%",
    textAlign: "center",
    marginBottom: "10%",
    marginLeft: "10%",
    marginRight: "10%"
  },
  selectedOption: {
    backgroundColor: '#D0D9E8',
  },
  inputDest: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 0,
    marginBottom: 0,
    fontSize: 16,
    marginTop: "-21%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: '#D3D3D3',
    borderWidth: 4,
    height: 60,
    marginLeft: "5%",
    marginRight: "5%"
  },
  inputLoc: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 0,
    marginBottom: 15,
    fontSize: 16,
    marginTop: "-9%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor: '#D3D3D3',
    borderWidth: 4,
    height: 60,
    marginLeft: "5%",
    marginRight: "5%"
  },
  transportOptions: {
    width: '90%',
    marginBottom: '30%',
    marginTop: "-30%",
    justifyContent: 'center',
    alignSelf: 'center',
  },
  option: {
    backgroundColor: '#4A5B6D',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionDetails: {
    flexDirection: 'row', // Arrange items in a row (side by side)
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 20,

  },
  optionText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 15, // Space between text elements
    fontFamily: 'Fredoka_400Regular',
  },
  optionSubText: {
    color: 'black',
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    fontWeight: '400',
    marginRight: 15, // Space between text elements
  },

  goToMapsButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    width: '80%',
    marginLeft: "10%",
    marginBottom: "30%",
    marginTop: "-30%"
  },
  goToMapsText: {
    fontFamily: "Fredoka_700Bold",
    color: '#001540',
    fontSize: 18,
  },
  icon: {

  },
  question: {
    fontSize: 20,
    fontFamily: "Fredoka_600SemiBold",
    color: '#fff',
    marginBottom: "33%",
    marginTop: "-33%",
    textAlign: 'center',
  },
  iconWrapper: {

    backgroundColor: '#fff',  // White background
    borderRadius: 10,  // Small border radius for square corners
    borderWidth: 0,  // Optional: Add border

  },
});
