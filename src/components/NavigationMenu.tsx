import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface NavigationMenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  colors: [string, string];
  onPress: () => void;
}

interface NavigationMenuProps {
  items: NavigationMenuItem[];
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.cardWrapper}
          activeOpacity={0.9}
          onPress={item.onPress}>
          <LinearGradient colors={item.colors} style={styles.card}>
            <View style={styles.iconWrapper}>
              <Icon name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    lineHeight: 16,
  },
});

export default NavigationMenu;
