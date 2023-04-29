import { Mesh, AnimationRange, Animatable, Animation, Vector3, Sound, StandardMaterial } from "@babylonjs/core";
import FacePlane from "./faceplane";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
export interface IAction {
    range: AnimationRange;
    direction: Vector3;
    name: string;
    running?: boolean;
    invert?: boolean;
    shift?: string;
    action?: Animatable;
    interpolation?: Animation;
}
export interface IPlayerActions {
    [keyChar: string]: IAction;
    [keyCode: number]: IAction;
}
export interface Sounds {
    build: Sound;
    throw: Sound;
    explosion: Sound;
    destroy: Sound;
    transit: Sound;
    rawData: {
        build: string;
        throw: string;
        explosion: string;
        destroy: string;
        transit: string;
    };
}
export default class Player extends Mesh {
    private _forwardKey;
    private _backwardKey;
    private _leftKey;
    private _rightKey;
    private _walkSpeed;
    private _runSpeed;
    private _transitionSpeed;
    private _animationSpeed;
    private _camera;
    private _actions;
    private _shift;
    private _targetBone;
    private _jumping;
    private _jumpValue;
    private _moveAxis;
    private _moveDirection;
    isLocalPlayer: boolean;
    playerId: number;
    facePlane: FacePlane;
    isReset: boolean;
    ballSpot: TransformNode;
    playerSounds: Sounds;
    facePlate: Mesh;
    ballFace: Mesh;
    faceTexture: RawTexture;
    faceMaterial: StandardMaterial;
    isDead: boolean;
    private _forwardPressed;
    private _backwardPressed;
    private _leftPressed;
    private _rightPressed;
    FindFace(bone: any): any;
    onStart(): void;
    onUpdate(): void;
    private _onKeyDown;
    private _onKeyUp;
    /**
     * Called each frame.
     */
    /**
     * Performs the action according to the given action object.
     */
    private _doAction;
    /**
     * Cancels the given action.
     */
    private _cancelAction;
    /**
     * Interpolates the given action weight.
     */
    private _interpolateAction;
    /**
     * Syncs the mesh rotation according to the current camera's direction.
     */
    private _syncRotation;
    /**
     * Called on the space key is up.
     */
    private _jump;
    /**
     * Called on a keyboard key is down.
     */
    /**
     * Called on a keyboard key is up.
     */
    /**
     * Called on the shift key is down.
     */
    private _shiftDown;
    /**
     * Called on the shift key is up.
     */
    private _shiftUp;
}
