import React, { useEffect, useState } from 'react';
import { Dimensions, Image} from 'react-native';
import Styles from '../Styles/StyleSheet';

export default function ResponsiveImage({ image, margin = 0 }) {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    Image.getSize(image, (width, height) => {
      const ratio = width / height;
      const screenWidth = Dimensions.get('window').width;
      const newWidth = screenWidth - margin * 2;
      const newHeight = newWidth / ratio;
      setImageWidth(newWidth);
      setImageHeight(newHeight);
    });
  }, [image]);

  return (
    <Image
      source={{ uri: image }}
      resizeMethod={'scale'}
      style={[Styles.ResponsiveImage.image, {width: imageWidth, height: imageHeight}]}
    />
  );
}
