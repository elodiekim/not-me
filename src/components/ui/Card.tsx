import { View, ViewProps } from 'react-native';

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <View
      className="rounded-card bg-background p-6"
      style={[
        {
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
