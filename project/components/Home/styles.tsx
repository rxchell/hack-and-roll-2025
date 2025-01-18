import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    welcometext: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 8,

    },
    orderbutton: {
        backgroundColor: '#ff9e4d',
        padding: 20,
        borderRadius: 10,
        margin: 16,
        width: width-50
    },
    rewardsbutton: {
        backgroundColor: '#ff9e4d',
        padding: 20,
        borderRadius: 10,
        margin: 16,
        width: width-50
    },
    image: {
        width: '100%',
        height: '100%',
    },
    wrapper: {},
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9DD6EB'
      },
});
