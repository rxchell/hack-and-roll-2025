import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      marginTop: 40,
      padding: 12,
    },
    verticallySpaced: {
      paddingTop: 4,
      paddingBottom: 4,
      alignSelf: 'stretch',
    },
    mt20: {
      marginTop: 20,
    },
    button: {
      backgroundColor: '#ff9e4d',
      padding: 13,
      borderRadius: 10,
      margin: 6,
      width: width-50
    },
    pointsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333', // Dark color for contrast
      textAlign: 'center',
    },
    avatar: {
      borderRadius: 5,
      overflow: 'hidden',
      maxWidth: '100%',
    },
    image: {
      objectFit: 'cover',
      paddingTop: 0,
      borderColor: 'rgb(0, 0, 0)',
      borderRadius: 5,
    },
    noImage: {
      backgroundColor: '#333',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgb(0, 0, 0)',
      borderRadius: 5,
    },
    profilepicturebutton: {
        backgroundColor: '#499EE3',
        padding: 5,
        borderRadius: 5,
        margin: 5,
    },
})