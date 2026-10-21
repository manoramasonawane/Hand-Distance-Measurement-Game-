# 🖐️ Hand Distance Measurement Game

An interactive, real-time Computer Vision web application built with **TypeScript, React, MediaPipe Tasks Vision, HTML5 Canvas 2D, and Web Audio API**. The app tracks human hand landmarks via webcam, measures real-time Euclidean distance between fingertips with physical calibration (pixels to centimetres), and challenges players with an interactive reflex target game.

---

## 🌟 Key Features

1. **Real-Time Hand Landmark Tracking:**
   - Detects all 21 3D hand joints with Google MediaPipe Hands at 30–60 FPS.
   - Highlights Thumb Tip (ID 4) and Index Finger Tip (ID 8) with neon visual markers.
   - Live hand count indicator and missing hand warnings.
   - Interactive Hand Simulator fallback for mouse/cursor testing without a webcam.

2. **Precision Distance Measurement:**
   - Real-time Euclidean distance calculation:
     $$\text{Distance}_{px} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
   - **Exponential Moving Average (EMA) Filter:** Eliminates sensor jitter for smooth readings.
   - **Interactive Calibration Tool:** Converts raw pixel distance into accurate real-world centimetres ($\text{cm}$) using physical references (e.g., credit card $8.56\text{ cm}$ or known finger span).
   - Real-time 30-frame sparkline history graph.

3. **Interactive Target Reflex Game:**
   - Virtual targets spawn randomly across the camera view.
   - **3 Difficulty Tiers:**
     - **Easy:** Stationary $46\text{ px}$ targets, $4.5\text{ s}$ lifespan, touch-to-collect.
     - **Medium:** Moving $34\text{ px}$ targets with boundary bounce physics, $3.2\text{ s}$ lifespan.
     - **Hard:** Fast $24\text{ px}$ moving targets requiring a **Pinch Gesture** to collect!
   - Dynamic combo multiplier and reaction time logger (in milliseconds).
   - Expanding particle burst animations and Web Audio sound effects on successful hits.
   - Configurable session durations ($30\text{ s}$, $60\text{ s}$, $90\text{ s}$).

4. **Leaderboard & Statistics:**
   - Session accuracy percentage, total targets hit, highest combo streak, and average reaction time.
   - Persistent local storage leaderboard.

5. **Modern Dark Cyberpunk UI:**
   - Deep navy and violet aesthetic designed for desktop, tablet, and laptop screens.

---

## 🎯 How to Play

1. **Grant Camera Permission:** Allow your web browser to access your webcam.
2. **Select Game Mode:** From the top navigation bar, choose **Play Target Game**.
3. **Configure Session:** Choose your difficulty (Easy, Medium, Hard) and timer (30s, 60s, 90s).
4. **Click "Start 3-2-1 Challenge":**
   - Position your hand in the camera frame.
   - Move your **Index Finger Tip** to the target.
   - In **Hard Mode**, touch your thumb and index fingers together (**PINCH**) to capture the target!
5. **Score High:** Hit targets rapidly to build consecutive combo streaks and maximize your score!

---

## 📐 Distance Calibration Guide

Webcams capture images in 2D perspective space ($x, y$ in pixels). The pixel distance varies with camera resolution and how close your hand is to the camera lens.

**To calibrate real centimetres (cm):**
1. Navigate to **Distance Lab & Calibration** in the navigation bar.
2. Hold your thumb and index fingers at a known distance (e.g. against an 8.56 cm standard card or a ruler).
3. Enter the known physical distance (e.g. $8.5\text{ cm}$) in the input box.
4. Click **Calibrate at Current Span**.
5. The application will compute the calibration ratio:
   $$R = \frac{\text{Pixel Distance}}{\text{Physical Distance in cm}}$$
   Subsequent readings will accurately reflect real-world centimetres!

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Webcam Blocked** | Browser permissions denied | Click the camera icon in browser address bar and choose "Allow". |
| **Hand not detected** | Poor lighting or backlight | Ensure your hand is well-lit. Avoid sitting with bright windows directly behind you. |
| **Jittery distance lines** | Sensor noise | Adjust the **Temporal Filter** slider in the Distance Lab to a lower value (e.g. `0.2` - `0.35`). |
| **No Webcam Available** | Hardware absent or in use | Click **"Simulate Hand"** in the top navigation bar to test with your mouse cursor! |

---

*Enjoy measuring, moving, and playing! 🖐️*
