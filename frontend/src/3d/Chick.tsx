/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three'
import { AnimationAction } from 'three'
import React, {useEffect, useRef, useState} from 'react'
import { useGLTF } from '@react-three/drei/useGLTF'

import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import {SkeletonUtils} from "three/examples/jsm/utils/SkeletonUtils";
import {setMaterials, setShadows} from "../utils/models";
import {useAnimations} from "@react-three/drei";

type GLTFResult = GLTF & {
  nodes: {
    Chick_LOD0: THREE.SkinnedMesh
    Chick_LOD1: THREE.SkinnedMesh
    Chick_LOD2: THREE.SkinnedMesh
    Chick_LOD3: THREE.SkinnedMesh
    root: THREE.Bone
  }
  materials: {
    Mat_Chick: THREE.MeshStandardMaterial
  }
}

type ActionName = 'Idle' | 'PickUp' | 'Punch' | 'RecieveHit' | 'Run' | 'SitDown' | 'Walk'
export type GLTFActions = Record<ActionName, AnimationAction>

export default function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>()
  const { scene } = useGLTF('/Chick.gltf') as GLTFResult
  const { animations: idleAnimations } = useGLTF('/Chick_Idle.gltf') as GLTF
  const { animations: walkAnimations } = useGLTF('/Chick_Walk.gltf') as GLTF

  const animations = [...idleAnimations, ...walkAnimations]

    // @ts-ignore
    const { actions } = useAnimations(animations, group) as { actions: GLTFActions}

    useEffect(() => {
        actions.Walk.play()
    }, [actions])

    const [cloned]: any = useState(() => {
        const clonedScene = SkeletonUtils.clone(scene)
        setMaterials(clonedScene)
        setShadows(clonedScene)
        return clonedScene
    })

  return (
    <group ref={group} {...props} rotation={[Math.PI / 2, 0, 0]} dispose={null}>
        <primitive object={cloned} dispose={null} />
    </group>
  )
}

useGLTF.preload('/Chick.gltf')