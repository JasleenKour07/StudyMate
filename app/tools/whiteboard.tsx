import * as React from 'react';
import { useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';


// Types for stroke points and saved stroke paths
type Point = { x: number; y: number };
type Stroke = { d: string; color: string; width: number };

export default function Whiteboard() {
  const [pages, setPages] = useState<Stroke[][]>([[]]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('black');
  const [currentColor, setCurrentColor] = useState('black');
  const [penSize, setPenSize] = useState(3);
  const [nextPenSize, setNextPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'line' | 'rectangle' | 'circle' | 'square' | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const drawing = useRef(false);
  const points = useRef<Point[]>([]);

  const paths = pages[currentPageIndex];

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      scale.value = Math.max(0.5, Math.min(scale.value, 5));
    });

  const lastPanX = useRef(0);
  const lastPanY = useRef(0);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      lastPanX.current = e.translationX;
      lastPanY.current = e.translationY;
    })
    .onUpdate((e) => {
      translateX.value += e.translationX - lastPanX.current;
      translateY.value += e.translationY - lastPanY.current;
      lastPanX.current = e.translationX;
      lastPanY.current = e.translationY;
    });

  const gesture = Gesture.Simultaneous(
    pinchGesture.enabled(!drawing.current),
    panGesture.enabled(!drawing.current)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const generatePathData = (pts: Point[]) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const handleStart = (e: any) => {
    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;
    drawing.current = true;
    setPenSize(nextPenSize);
    setStartPoint({ x, y });

    if (selectedTool === 'pen') {
      points.current = [{ x, y }];
      setCurrentPath(generatePathData(points.current));
    }
  };

  const handleMove = (e: any) => {
    if (!drawing.current || !startPoint) return;

    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;

    if (selectedTool === 'pen') {
      points.current.push({ x, y });
      setCurrentPath(generatePathData(points.current));
    } else if (selectedTool === 'line') {
      setCurrentPath(`M ${startPoint.x} ${startPoint.y} L ${x} ${y}`);
    } else if (selectedTool === 'rectangle') {
      const w = x - startPoint.x;
      const h = y - startPoint.y;
      setCurrentPath(`M ${startPoint.x} ${startPoint.y} h ${w} v ${h} h ${-w} Z`);
    } else if (selectedTool === 'square') {
      const size = Math.min(Math.abs(x - startPoint.x), Math.abs(y - startPoint.y));
      const dx = x < startPoint.x ? -size : size;
      const dy = y < startPoint.y ? -size : size;
      setCurrentPath(`M ${startPoint.x} ${startPoint.y} h ${dx} v ${dy} h ${-dx} Z`);
    } else if (selectedTool === 'circle') {
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      const cx = startPoint.x;
      const cy = startPoint.y;
      setCurrentPath(`M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy}`);
    }
  };

  const handleEnd = () => {
    if (!drawing.current) return;

    const newStroke = { d: currentPath || generatePathData(points.current), color: selectedColor, width: penSize };

    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[currentPageIndex] = [...updated[currentPageIndex], newStroke];
      return updated;
    });

    setCurrentPath('');
    setStartPoint(null);
    drawing.current = false;
    points.current = [];
  };

  const handleClear = () => {
    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[currentPageIndex] = [];
      return updated;
    });
    setCurrentPath('');
    points.current = [];
  };

  const handleUndo = () => {
    setPages((prevPages) => {
      const updated = [...prevPages];
      updated[currentPageIndex] = updated[currentPageIndex].slice(0, -1);
      return updated;
    });
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setSelectedColor(color);
    setIsEraser(false);
  };

  const increaseSize = () => {
    setNextPenSize((prev) => Math.min(prev + 1, 30));
  };

  const decreaseSize = () => {
    setNextPenSize((prev) => Math.max(prev - 1, 1));
  };

  const handleNewPage = () => {
    setPages([...pages, []]);
    setCurrentPageIndex(pages.length);
  };

  const { width, height } = Dimensions.get('window');

  return (
  <SafeAreaView style={{ flex: 1 }}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.canvasContainer, animatedStyle]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleStart}
            onResponderMove={handleMove}
            onResponderRelease={handleEnd}
          >
          <Svg width={width - 80} height={height} style={StyleSheet.absoluteFillObject}>
              {paths.map((path, index) => (
                <Path
                  key={index}
                  d={path.d}
                  stroke={path.color}
                  strokeWidth={path.width}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              {currentPath !== '' && (
                <Path
                  d={currentPath}
                  stroke={selectedColor}
                  strokeWidth={penSize}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </Svg>
          </Animated.View>
        </GestureDetector>

              

        <View style={styles.sidebar}>
          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.sidebarButton, selectedTool === 'pen' && !isEraser && { backgroundColor: '#ccc' }]}
              onPress={() => {
                if (selectedTool === 'pen' && !isEraser) {
                  setSelectedTool(null);
                } else {
                  setSelectedTool('pen');
                  setIsEraser(false);
                  setSelectedColor(currentColor);
                }
              }}
            >
              <Text>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidebarButton, isEraser && { backgroundColor: '#ccc' }]}
              onPress={() => {
                setIsEraser(true);
                setSelectedColor('#ffffff');
              }}
            >
              <Text>🧽</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.sidebarButton, selectedTool === 'line' && { backgroundColor: '#ccc' }]}
              onPress={() => setSelectedTool('line')}
            >
              <Text>📏</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, selectedTool === 'rectangle' && { backgroundColor: '#ccc' }]}
              onPress={() => setSelectedTool('rectangle')}
            >
              <Text>▭</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.sidebarButton, selectedTool === 'circle' && { backgroundColor: '#ccc' }]}
              onPress={() => setSelectedTool('circle')}
            >
              <Text style={{ color: '#6C63FF', fontSize: 18 }}>◯</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, selectedTool === 'square' && { backgroundColor: '#ccc' }]}
              onPress={() => setSelectedTool('square')}
            >
              <Text>◼️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.colorOptions}>
            {['black', 'red', 'green', 'blue', 'orange', '#6C63FF'].map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleColorChange(color)}
                style={[styles.colorDot, {
                  backgroundColor: color,
                  borderWidth: selectedColor === color && !isEraser ? 2 : 0,
                }]}
              />
            ))}
          </View>

          <Text style={{ fontSize: 12, marginTop: 10 }}>Size: {nextPenSize}</Text>
          <View style={styles.sizeControls}>
            <TouchableOpacity style={styles.sizeButton} onPress={decreaseSize}>
              <Text>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sizeButton} onPress={increaseSize}>
              <Text>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sidebarButton} onPress={handleUndo}>
            <Text>↩️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={handleClear}>
            <Text>🗑</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={handleNewPage}>
            <Text>➕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden', // prevent clipping overflow
    backgroundColor: '#ffffff',
  },
  sidebar: {
    width: 80,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  sidebarButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  toolRow: {
    flexDirection: 'row',
    gap: 5,
  },
  colorOptions: {
    flexDirection: 'column',
    gap: 10,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: '#000',
  },
  sizeControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButton: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
