import React from 'react';
import {StyleSheet,Text,View,TouchableOpacity,Animated,ScrollView,Dimensions,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

function FloatingParticle({
  size,
  left,
  top,
  delay,
}: {
  size: number;
  left: string;
  top: string;
  delay: number;
}) {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(0.3);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 1250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 1250,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left: (parseFloat(left) / 100) * screenWidth,
          top: (parseFloat(top) / 100) * screenHeight,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  return (
  <SafeAreaView style={styles.container}>

    <FloatingParticle size={8} left="10%" top="12%" delay={0} />
    <FloatingParticle size={5} left="25%" top="25%" delay={500} />
    <FloatingParticle size={7} left="42%" top="10%" delay={1000} />
    <FloatingParticle size={4} left="60%" top="30%" delay={1500} />
    <FloatingParticle size={9} left="78%" top="15%" delay={700} />
    <FloatingParticle size={5} left="90%" top="40%" delay={1200} />
    <FloatingParticle size={6} left="15%" top="50%" delay={1800} />
    <FloatingParticle size={4} left="50%" top="55%" delay={300} />
    <FloatingParticle size={7} left="70%" top="60%" delay={900} />
    <FloatingParticle size={5} left="85%" top="70%" delay={1400} />

    <View style={styles.content}>
        
        <Text style={styles.logo}>AI Study</Text>

        <Text style={styles.title}>
          Your Smart Study Assistant
        </Text>

        <Text style={styles.subtitle}>
          Learn smarter, organize your studies, and get AI-powered assistance.
        </Text>

        <TouchableOpacity
         style={styles.button}
         onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
  >
    {/* Study Planner */}
    <View style={styles.carouselCard}>
      <Text style={styles.cardTitle}>📚 Study Planner</Text>
      <Text style={styles.cardText}>
        Organize your subjects and study schedule.
      </Text>
    </View>

    {/* AI Assistant */}
    <View style={styles.carouselCard}>
      <Text style={styles.cardTitle}>✨ AI Assistant</Text>
      <Text style={styles.cardText}>
        Ask questions and get help with your studies.
      </Text>
    </View>

    {/* Track Progress */}
    <View style={styles.carouselCard}>
      <Text style={styles.cardTitle}>📊 Track Progress</Text>
      <Text style={styles.cardText}>
        Monitor your learning and improve every day.
      </Text>
    </View>
  </ScrollView>
</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    backgroundColor: '#ff1717',
    borderRadius: 100,
    zIndex: 1,
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFD600',
    zIndex: 1,
  },

  content: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    zIndex: 2,
  },

  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 30,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 25,
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 35,
  },

  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  features: {
    gap: 15,
  },

  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },

  carouselCard: {
    width: 350,
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    justifyContent: 'center',
},

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
