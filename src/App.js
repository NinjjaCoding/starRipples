import './App.css';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import stars from './assets/stars.png';
import { Suspense, useCallback, useMemo, useRef } from 'react';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'; //react does not have one but we can use extend method to create one
extends({OrbitControls})

function CameraControls() { //function to get location of mouse so need access to domElement 
  const {
    camera,
    gl: {domElement}
  } = useThree();

    //update the frame and canvas 
  const controlsRef = useRef();
  useFrame(() => controlsRef.current.update())

  return (
    <OrbitControls 
      ref={controlsRef}
      args={[camera, domElement]}
      autoRotate
      autoRotateSpeed= {-0.2}
    />
  );
}


//function to control the stars/points- use points class from three.jsdocs codes come from  
function Points() {//to load the stars we need to load it as texture then pass as mapped texture to each star
  const imgTex = useLoader(THREE.TextureLoader, stars)//for the stars we need the count of stars(how many) and separation(distance between them)
  const bufferRef = useRef();
      //now to make stars wave and wavie we need to use sin equaltions of 2 pie 
      //and if we double and triple the amplitudes then we can do different effects
      // z = sin((x^2 + y^2 + 3) * 2) * 0.2 changing variable will give different effects which i found interesting can be applied to markets
  let p = 0; //phase
  let f = 0.002; //frequency number from docs
  let a = 3; //amplitude tweak them to see what works
      
      //function to create position of stars taking z & x and output y value on graph
  const graph = useCallback((x, z) => {
    return Math.sin(f * (x ** 2 + z ** 2 + p)) * a;
  }, [p, f, a]) //graph to remember to rerender phase, frequesncy n amplitude


  const count = 100;
  const separation = 3;//since each star represent 3 coodinate points then we can make to single point in array
  let positions = useMemo(() => {
    let positions = []

    //for loop for the arragnement of stars
    for(let xi = 0; xi < count; xi++) { //along x n 
      for(let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2 ); //to make them uniform across
        let z = separation * (zi - count / 2 );
        let y = graph(x, z);
        positions.push(x, y, z);
      }
    }
    return new Float32Array(positions);
  }, [count, separation, graph])

  useFrame(() => {
    p += 15 //you can change pahse to see diff effects
    a += 0.1 //makes the star jump high along the amplitutde lines
    const positions= bufferRef.current.array;

    let i = 0;
    for(let xi = 0; xi < count; xi++) { //along x n 
      for(let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2 ); //to make them uniform across
        let z = separation * (zi - count / 2 );
        positions[i + 1] = graph(x, z);
        i += 3;
      }
    }
    bufferRef.current.needsUpdate = true;
  })

  return( //below is all from docs react fiber three  
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute 
          ref={bufferRef}
          attachObject={['attributes', 'position']}
          array={positions} //array to hold postions of stars
          count= {positions.Length / 3}
          itemSize={3}
        />
      </bufferGeometry>

        <pointsMaterial
          attach='material'
          map={imgTex}
          color={0x00AAFF}
          size={0.5}
          sizeAttenuation
          transparent={false}
          alphaTest={0.5}
          opacity={1.0}
        />
    </points>
  );
}
 
//function to animate on canvas
function AnimationCanvas() {
  return(
    <Canvas
      colorManagement={ false }
      camera={{position: [100, 10, 0], fov: 75}}
      >
        <Suspense fallback={null}>
        <Points/>
        </Suspense>
        <CameraControls/>
        
    </Canvas>
  );
}

  //suspense component is a ui while app canvas is loading..it could take time,,,while loading use suspense 
function App() {
  return (
    <div className="anim"> 
       <Suspense fallback={<div>Loading...</div>}>
          <AnimationCanvas/> 
       </Suspense>    
    </div>
  );
}

export default App;
