import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  GestureResponderEvent,
  TouchableOpacity,
  Linking
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

type Point = {
  x: number;
  y: number;
};

type DrawingPath = {
  id: number;
  color: string;
  width: number;
  points: Point[];
};

const COLORS = [
  "#111827", // almost black
  "#f97316", // orange
  "#22c55e", // green
  "#0ea5e9", // blue
  "#e11d48", // pink/red
  "#facc15", // yellow
];

const WIDTHS = [2, 4, 8, 12];

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();

  // Responsive canvas size
  const canvasWidth = Math.min(windowWidth - 32, 800);
  const canvasHeight = canvasWidth * 0.75;

  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [nextId, setNextId] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const hasStrokes = paths.length > 0 || currentPath !== null;

  const handleStartDrawing = useCallback(
    (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath: DrawingPath = {
        id: nextId,
        color,
        width: strokeWidth,
        points: [{ x: locationX, y: locationY }],
      };
      setNextId((id) => id + 1);
      setCurrentPath(newPath);
      setIsDrawing(true);
    },
    [color, strokeWidth, nextId]
  );

  const handleMoveDrawing = useCallback((evt: GestureResponderEvent) => {
    if (!isDrawing) return;

    const { locationX, locationY } = evt.nativeEvent;

    setCurrentPath((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, { x: locationX, y: locationY }],
      };
    });
  }, [isDrawing]);

  const handleEndDrawing = useCallback(() => {
    setIsDrawing(false);
    setCurrentPath((prev) => {
      if (!prev) return null;
      setPaths((existing) => [...existing, prev]);
      return null;
    });
  }, []);

  const allPaths = useMemo(
    () => (currentPath ? [...paths, currentPath] : paths),
    [paths, currentPath]
  );

  const buildPathD = (p: DrawingPath): string => {
    if (!p.points.length) return "";
    const [first, ...rest] = p.points;
    let d = `M ${first.x} ${first.y}`;
    for (const pt of rest) {
      d += ` L ${pt.x} ${pt.y}`;
    }
    return d;
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const REPO_URL = "https://github.com/europanite/drawing";

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => Linking.openURL(REPO_URL)}>
          <Text style={styles.title}>Browser Drawing Playground</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Draw with your mouse or finger. Choose a color and stroke width,
          then start drawing on the canvas below.
        </Text>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          {/* Color picker */}
          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <View key={c} style={styles.colorWrapper}>
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c },
                      color === c && styles.colorSwatchActive,
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={() => setColor(c)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Stroke width picker */}
          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Stroke</Text>
            <View style={styles.widthRow}>
              {WIDTHS.map((w) => (
                <View
                  key={w}
                  style={[
                    styles.widthChip,
                    strokeWidth === w && styles.widthChipActive,
                  ]}
                  onStartShouldSetResponder={() => true}
                  onResponderRelease={() => setStrokeWidth(w)}
                >
                  <View
                    style={[
                      styles.widthPreview,
                      { height: w, borderRadius: w / 2 },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Actions</Text>
            <View style={styles.actionsRow}>
              <View
                style={[
                  styles.actionButton,
                  !paths.length && styles.actionButtonDisabled,
                ]}
                onStartShouldSetResponder={() => !(!paths.length)}
                onResponderRelease={handleUndo}
              >
                <Text style={styles.actionButtonText}>Undo</Text>
              </View>
              <View
                style={[
                  styles.actionButton,
                  !hasStrokes && styles.actionButtonDisabled,
                  styles.actionButtonClear,
                ]}
                onStartShouldSetResponder={() => !(!hasStrokes)}
                onResponderRelease={handleClear}
              >
                <Text style={styles.actionButtonText}>Clear</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Canvas */}
        <View
          style={[
            styles.canvasContainer,
            { width: canvasWidth, height: canvasHeight },
          ]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleStartDrawing}
          onResponderMove={handleMoveDrawing}
          onResponderRelease={handleEndDrawing}
          onResponderTerminate={handleEndDrawing}
        >
          <Svg width={canvasWidth} height={canvasHeight}>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="#ffffff"
            />
            {allPaths.map((p) => (
              <Path
                key={p.id}
                d={buildPathD(p)}
                stroke={p.color}
                strokeWidth={p.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
        </View>

        <Text style={styles.hint}>
          Tip: On mobile, draw with your finger. On desktop, draw with your
          mouse.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  content: {
    width: "100%",
    maxWidth: 900,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  toolbar: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  toolbarGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toolbarLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  colorRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorWrapper: {
    marginRight: 8,
    marginBottom: 4,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  colorSwatchActive: {
    borderColor: "#111827",
  },
  widthRow: {
    flex: 1,
    flexDirection: "row",
  },
  widthChip: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  widthChipActive: {
    borderColor: "#111827",
    backgroundColor: "#e5e7eb",
  },
  widthPreview: {
    width: "80%",
    backgroundColor: "#111827",
  },
  actionsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginLeft: 8,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#111827",
  },
  actionButtonClear: {
    backgroundColor: "#b91c1c",
    borderColor: "#7f1d1d",
  },
  actionButtonDisabled: {
    backgroundColor: "#e5e7eb",
    borderColor: "#d1d5db",
  },
  actionButtonText: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "600",
  },
  canvasContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
