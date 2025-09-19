import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  BackHandler
} from 'react-native';
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  return (
      <View style={styles.container}>
        {/* Main content area */}
        <View style={styles.content}>
          {/* 🔥 Top section with background image */}
          <ImageBackground
              source={{
                uri: 'https://i.pinimg.com/1200x/0f/b1/12/0fb112396261721f651417a92fe58412.jpg',
              }}
              style={styles.imageSection}
              imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
              resizeMode="cover"
          >
            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeLeaf} />
          </ImageBackground>

          {/* Bottom section with content */}
          <View style={styles.bottomSection}>
            {/* Main heading */}
            <Text style={styles.mainHeading}>
              Welcome to TasteLanka 🇱🇰🌾
            </Text>

            <Text style={styles.description}>
              Discover the rich culinary heritage of Sri Lanka with our handpicked recipes.
              From spicy curries to sweet delights, TasteLanka brings authentic flavors
              straight to your kitchen in a simple and healthy way.
            </Text>



            {/* Buttons section */}
            <View style={styles.buttonsContainer}>
              {/* Skip button */}
              <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => BackHandler.exitApp()}   // close app
                  activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              {/* Next button */}
              <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.8}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    top:30,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    height:500,
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 120,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  decorativeLeaf: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomSection: {
    flex: 0.35,
    paddingHorizontal: 30,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  description: {
    fontSize: 14,
    color: '#7A8A99',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  skipButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
