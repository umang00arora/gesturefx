import { useEffect, useRef } from "react";

function HandTracker() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {

    const loadScripts = async () => {

      // =====================================
      // LOAD MEDIAPIPE SCRIPTS
      // =====================================

      const handsScript = document.createElement("script");
      handsScript.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";

      const faceMeshScript = document.createElement("script");
      faceMeshScript.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

      const cameraScript = document.createElement("script");
      cameraScript.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

      const drawingScript = document.createElement("script");
      drawingScript.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";

      document.body.appendChild(handsScript);
      document.body.appendChild(faceMeshScript);
      document.body.appendChild(cameraScript);
      document.body.appendChild(drawingScript);

      // =====================================
      // WAIT FOR ALL SCRIPTS
      // =====================================

      Promise.all([

        new Promise((resolve) => {
          handsScript.onload = resolve;
        }),

        new Promise((resolve) => {
          faceMeshScript.onload = resolve;
        }),

        new Promise((resolve) => {
          cameraScript.onload = resolve;
        }),

        new Promise((resolve) => {
          drawingScript.onload = resolve;
        }),

      ]).then(() => {

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;

        const canvasCtx =
          canvasElement.getContext("2d");

        // =====================================
        // FILTER IMAGES
        // =====================================

        const filters = {

          sunglasses: new Image(),

          crown: new Image(),

          mustache: new Image(),

          clownnose: new Image(),

          animeeyes: new Image(),
        };

        filters.sunglasses.src =
          "/filters/sunglasses.png";

        filters.crown.src =
          "/filters/crown.png";

        filters.mustache.src =
          "/filters/mustache.png";

        filters.clownnose.src =
          "/filters/clownnose.png";

        filters.animeeyes.src =
          "/filters/animeeyes.png";

        // =====================================
        // FACE DATA
        // =====================================

        let faceLandmarks = null;

        // =====================================
        // COUNT FINGERS
        // =====================================

        const countFingers = (landmarks) => {

          let fingers = 0;

          // THUMB
          if (landmarks[4].x < landmarks[3].x) {
            fingers++;
          }

          // INDEX
          if (landmarks[8].y < landmarks[6].y) {
            fingers++;
          }

          // MIDDLE
          if (landmarks[12].y < landmarks[10].y) {
            fingers++;
          }

          // RING
          if (landmarks[16].y < landmarks[14].y) {
            fingers++;
          }

          // PINKY
          if (landmarks[20].y < landmarks[18].y) {
            fingers++;
          }

          return fingers;
        };

        // =====================================
        // FACEMESH
        // =====================================

        const faceMesh =
          new window.FaceMesh({

            locateFile: (file) => {

              return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
          });

        faceMesh.setOptions({

          maxNumFaces: 1,

          refineLandmarks: true,

          minDetectionConfidence: 0.7,

          minTrackingConfidence: 0.7,
        });

        faceMesh.onResults((results) => {

          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {

            faceLandmarks =
              results.multiFaceLandmarks[0];
          }
        });

        // =====================================
        // HANDS
        // =====================================

        const hands = new window.Hands({

          locateFile: (file) => {

            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({

          maxNumHands: 2,

          modelComplexity: 1,

          minDetectionConfidence: 0.7,

          minTrackingConfidence: 0.7,
        });

        hands.onResults((results) => {

          canvasCtx.save();

          canvasCtx.clearRect(
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          // =====================================
          // MIRROR CAMERA
          // =====================================

          canvasCtx.translate(
            canvasElement.width,
            0
          );

          canvasCtx.scale(-1, 1);

          // =====================================
          // DRAW CAMERA FEED
          // =====================================

          canvasCtx.drawImage(
            results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          // =====================================
          // FACE FILTERS
          // =====================================

          if (faceLandmarks) {

            const leftEye =
              faceLandmarks[33];

            const rightEye =
              faceLandmarks[263];

            const nose =
              faceLandmarks[1];

            const forehead =
              faceLandmarks[10];

            // =====================================
            // FACE MEASUREMENTS
            // =====================================

            const eyeDistance =
              Math.abs(
                rightEye.x - leftEye.x
              ) * canvasElement.width;

            const centerX =
              (leftEye.x + rightEye.x) / 2
              * canvasElement.width;

            const centerY =
              (leftEye.y + rightEye.y) / 2
              * canvasElement.height;

            // =====================================
            // HEAD ROTATION
            // =====================================

            const angle =
              Math.atan2(
                rightEye.y - leftEye.y,
                rightEye.x - leftEye.x
              );

            // =====================================
            // DRAW FILTER BASED ON FINGERS
            // =====================================

            if (
              results.multiHandLandmarks &&
              results.multiHandLandmarks.length > 0
            ) {

              const fingerCount =
                countFingers(
                  results.multiHandLandmarks[0]
                );

              // =====================================
              // 😎 SUNGLASSES
              // =====================================

              if (fingerCount === 1) {

                const width =
                  eyeDistance * 2;

                const height =
                  width * 0.55;

                canvasCtx.save();

                canvasCtx.translate(
                  centerX,
                  centerY
                );

                canvasCtx.rotate(angle);

                canvasCtx.drawImage(
                  filters.sunglasses,
                  -width / 2,
                  -height / 2,
                  width,
                  height
                );

                canvasCtx.restore();
              }

              // =====================================
              // 👑 CROWN
              // =====================================

              if (fingerCount === 2) {

                const width =
                  eyeDistance * 2.1;

                const height =
                  width * 0.75;

                canvasCtx.save();

                canvasCtx.translate(
                  centerX,
                  forehead.y * canvasElement.height - 80
                );

                canvasCtx.rotate(angle);

                canvasCtx.drawImage(
                  filters.crown,
                  -width / 2,
                  -height / 2,
                  width,
                  height
                );

                canvasCtx.restore();
              }

              // =====================================
              // 👨 MUSTACHE
              // =====================================

              if (fingerCount === 3) {

                const width =
                  eyeDistance * 1.1;

                const height =
                  width * 0.35;

                canvasCtx.save();

                canvasCtx.translate(
                  nose.x * canvasElement.width,
                  nose.y * canvasElement.height + 40
                );

                canvasCtx.rotate(angle);

                canvasCtx.drawImage(
                  filters.mustache,
                  -width / 2,
                  -height / 2,
                  width,
                  height
                );

                canvasCtx.restore();
              }

              // =====================================
// 🤡 GLASSES + NOSE FILTER
// =====================================

if (fingerCount === 4) {

  const width =
    eyeDistance * 1.7;

  const height =
    width * 0.65;

  canvasCtx.save();

  // Position between eyes
  canvasCtx.translate(
    centerX,
    centerY + 5
  );

  canvasCtx.rotate(angle);

  canvasCtx.drawImage(
    filters.clownnose,
    -width / 2,
    -height / 2,
    width,
    height
  );

  canvasCtx.restore();
}

              // =====================================
              // 👀 ANIME EYES
              // =====================================

              if (fingerCount === 5) {

                const width =
                  eyeDistance * 1.8;

                const height =
                  width * 0.5;

                canvasCtx.save();

                canvasCtx.translate(
                  centerX,
                  centerY
                );

                canvasCtx.rotate(angle);

                canvasCtx.drawImage(
                  filters.animeeyes,
                  -width / 2,
                  -height / 2,
                  width,
                  height
                );

                canvasCtx.restore();
              }
            }
          }

          // =====================================
          // HAND TRACKING
          // =====================================

          if (results.multiHandLandmarks) {

            for (
              const landmarks
              of results.multiHandLandmarks
            ) {

              // Draw connectors
              window.drawConnectors(
                canvasCtx,
                landmarks,
                window.HAND_CONNECTIONS,
                {
                  color: "#00FF00",
                  lineWidth: 4,
                }
              );

              // Draw landmarks
              window.drawLandmarks(
                canvasCtx,
                landmarks,
                {
                  color: "#FF0000",
                  lineWidth: 2,
                }
              );

              // =====================================
              // FINGER COUNT
              // =====================================

              const fingerCount =
                countFingers(landmarks);

              // Unmirror text
              canvasCtx.save();

              canvasCtx.scale(-1, 1);

              canvasCtx.font =
                "40px Arial";

              canvasCtx.fillStyle =
                "cyan";

              canvasCtx.fillText(
                `Fingers: ${fingerCount}`,
                -300,
                50
              );

              canvasCtx.restore();
            }
          }

          canvasCtx.restore();
        });

        // =====================================
        // CAMERA
        // =====================================

        const camera = new window.Camera(
          videoElement,
          {

            onFrame: async () => {

              await hands.send({
                image: videoElement,
              });

              await faceMesh.send({
                image: videoElement,
              });
            },

            width: 1280,

            height: 720,
          }
        );

        camera.start();
      });
    };

    loadScripts();

  }, []);

  return (
    <div className="video-container">

      <video
        ref={videoRef}
        style={{ display: "none" }}
      />

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
      />

    </div>
  );
}

export default HandTracker;