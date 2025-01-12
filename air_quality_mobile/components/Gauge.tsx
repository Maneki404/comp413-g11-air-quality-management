import { Colors } from "@/constants/Colors";
import { moderateScale } from "@/helpers/responsive";
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface GaugeProps {
  percent?: number;
  radius: number;
  [key: string]: any; // for rest props
}

export const Gauge: React.FC<GaugeProps> = ({
  percent = 0,
  radius,
  ...rest
}) => {
  const strokeWidth = radius * 0.07;
  const innerRadius = radius - strokeWidth;
  const circumference = innerRadius * 2 * Math.PI;
  const arc = circumference * 0.75;
  const dashArray = `${arc} ${circumference}`;
  const transform = `rotate(135, ${radius}, ${radius})`;
  const offset = arc - (percent / 100) * arc;

  return (
    <View style={{ height: radius * 2 }}>
      <Svg height={radius * 2} width={radius * 2} {...rest}>
        <Defs>
          {percent < 25 ? (
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="50%" stopColor={Colors.gauge1} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.gauge2} stopOpacity="1" />
            </LinearGradient>
          ) : percent < 50 ? (
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="50%" stopColor={Colors.gauge3} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.gauge4} stopOpacity="1" />
            </LinearGradient>
          ) : percent < 75 ? (
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="50%" stopColor={Colors.gauge5} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.gauge6} stopOpacity="1" />
            </LinearGradient>
          ) : (
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="50%" stopColor={Colors.gauge7} stopOpacity="1" />
              <Stop offset="100%" stopColor={Colors.gauge8} stopOpacity="1" />
            </LinearGradient>
          )}
        </Defs>

        <Circle
          cx={radius}
          cy={radius}
          fill="transparent"
          r={innerRadius}
          stroke="gray"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={transform}
        />

        <Circle
          cx={radius}
          cy={radius}
          fill="transparent"
          r={innerRadius}
          stroke="url(#grad)"
          strokeDasharray={dashArray}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={transform}
        />
      </Svg>
      <Text
        style={{
          color: "white",
          textAlign: "center",
          top: -radius * 1.3,
          fontSize: moderateScale(25),
          fontFamily: "PoppinsLight",
        }}
      >
        {percent >= 90
          ? "Excellent"
          : percent >= 70
          ? "Good"
          : percent >= 50
          ? "Moderate"
          : percent >= 25
          ? "Poor"
          : percent >= 10
          ? "Very Poor"
          : "Hazardous"}
      </Text>
      <Text
        style={{
          color: "white",
          textAlign: "center",
          fontSize: moderateScale(25),
          fontFamily: "PoppinsLight",
          top: -radius * 1.3,
        }}
      >
        {percent + "%"}
      </Text>
    </View>
  );
};
