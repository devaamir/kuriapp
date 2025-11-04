import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width: number;
  height: number;
  fill: string;
  opacity?: number;
}

export const HomeIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20ZM19 19V9.97815L12 4.53371L5 9.97815V19H19ZM7 15H17V17H7V15Z" fill={fill} />
  </Svg>
);

export const ChartIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M11 7H13V17H11V7ZM15 11H17V17H15V11ZM7 13H9V17H7V13ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z" fill={fill} />
  </Svg>
);

export const NotificationIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M20 17H22V19H2V17H4V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10V17ZM18 17V10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10V17H18ZM9 21H15V23H9V21Z" fill={fill} />
  </Svg>
);

export const AvatarIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill={fill} />
  </Svg>
);

export const PlusIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z" fill={fill} />
  </Svg>
);

export const SearchIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z" fill={fill} />
  </Svg>
);

export const CloseIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" fill={fill} />
  </Svg>
);

export const BackArrowIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" fill={fill} />
  </Svg>
);

export const SettingsIcon = ({ width, height, fill, opacity = 1 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" opacity={opacity}>
    <Path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill={fill} />
  </Svg>
);
