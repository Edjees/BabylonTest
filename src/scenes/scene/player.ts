import {
    Mesh, AnimationRange, Animatable, ArcRotateCamera, Animation, Vector3,
    Space, Bone, KeyboardInfo, KeyboardEventTypes, Epsilon, Quaternion, Scalar, Sound, StandardMaterial
} from "@babylonjs/core";

import { visibleInInspector, onKeyboardEvent, fromScene } from "../decorators";
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

export interface Sounds{
    build: Sound
    throw: Sound
    explosion: Sound
    destroy: Sound
    transit: Sound
    rawData: {
        build: string
        throw: string
        explosion: string
        destroy: string
        transit: string
    }
}

export default class Player extends Mesh {
    @visibleInInspector("KeyMap", "Forward Key", "z".charCodeAt(0))
    private _forwardKey: number;

    @visibleInInspector("KeyMap", "Backward Key", "s".charCodeAt(0))
    private _backwardKey: number;

    @visibleInInspector("KeyMap", "Left Key", "q".charCodeAt(0))
    private _leftKey: number;

    @visibleInInspector("KeyMap", "Right Key", "d".charCodeAt(0))
    private _rightKey: number;

    @visibleInInspector("number", "Walk Speed", 1)
    private _walkSpeed: number;

    @visibleInInspector("number", "Run Speed", 2)
    private _runSpeed: number;

    @visibleInInspector("number", "Transition Speed", 1)
    private _transitionSpeed: number;

    @visibleInInspector("number", "Animation Speed", 1)
    private _animationSpeed: number;

    //@fromScene("playerCamera")
    private _camera: ArcRotateCamera;

    private _actions: IPlayerActions = { };
    private _shift: boolean = false;
    private _targetBone: Bone = null;

    private _jumping: boolean = false;
    private _jumpValue: number = 0;

    private _moveAxis: Vector3 = Vector3.Zero();
    private _moveDirection: Vector3 = Vector3.Zero();

    public isLocalPlayer = false
    public playerId: number
    public facePlane: FacePlane

    public isReset = false

    public ballSpot: TransformNode

    public playerSounds: Sounds = {
        build:null, 
        destroy:null,
        throw:null,
        explosion:null,
        transit:null,
        rawData:{
            build:null, 
            destroy:null,
            throw:null,
            explosion:null,
            transit:null,
        }
    };

    public facePlate: Mesh
    public ballFace: Mesh
    public faceTexture: RawTexture
    public faceMaterial: StandardMaterial

    public isDead = false

    private _forwardPressed: boolean = false;
    private _backwardPressed: boolean = false;
    private _leftPressed: boolean = false;
    private _rightPressed: boolean = false;


    public FindFace(bone){

        const meshes = bone._children
        if(meshes){
            return <FacePlane>meshes[0]
        }

        const children = bone.getChildren()
        for (let i = 0; i < children.length; i++) {
            return this.FindFace(children[i])
        }
    }

    public onStart(): void {
        // Allow matrices interpolation.
        Animation.AllowMatricesInterpolation = true;

        // Configure ellipsoid
        this.ellipsoid.set(20, 100, 20);
        this.ellipsoidOffset.set(0, 100, 0);
        
        this.isLocalPlayer = true


        // Configure actions.

        // Get the bone the camera must target
        this._targetBone = this.absolutePosition
        this._camera = <ArcRotateCamera>this._scene.getNodeByName("playerCamera")
        this._camera.panningAxis = Vector3.Zero()

        // Default animation, idle

    }

    public onUpdate(): void {
        if (!this.isLocalPlayer){
            return
        }

        this._moveAxis.set(0, 0, 0);

        // Update movement axis based on key states
        if (this._forwardPressed) this._moveAxis.z += 1;
        if (this._backwardPressed) this._moveAxis.z -= 1;
        if (this._leftPressed) this._moveAxis.x -= 1;
        if (this._rightPressed) this._moveAxis.x += 1;

        this._moveAxis.normalize();
        const speed = this._shift ? this._walkSpeed : this._runSpeed;
        this._moveAxis.scaleInPlace(speed * this._scene.getAnimationRatio());

        this.getDirectionToRef(this._moveAxis, this._moveDirection);
        this._moveDirection.y = this._scene.gravity.y + this._jumpValue;
        this.moveWithCollisions(this._moveDirection);

    
        this._camera.target.copyFrom(this._targetBone);
    
        if (this._moveAxis != Vector3.ZeroReadOnly) {
            this._syncRotation(-this._camera.alpha - (Math.PI * 0.5));
        }
    }

    // ... (same methods as before)

    @onKeyboardEvent([], KeyboardEventTypes.KEYDOWN)
    private _onKeyDown(info: KeyboardInfo): void {
        switch (info.event.keyCode) {
            case this._forwardKey:
                this._forwardPressed = true;
                break;
            case this._backwardKey:
                this._backwardPressed = true;
                break;
            case this._leftKey:
                this._leftPressed = true;
                break;
            case this._rightKey:
                this._rightPressed = true;
                break;
        }
    }

    @onKeyboardEvent([], KeyboardEventTypes.KEYUP)
    private _onKeyUp(info: KeyboardInfo): void {
        switch (info.event.keyCode) {
            case this._forwardKey:
                this._forwardPressed = false;
                break;
            case this._backwardKey:
                this._backwardPressed = false;
                break;
            case this._leftKey:
                this._leftPressed = false;
                break;
            case this._rightKey:
                this._rightPressed = false;
                break;
        }
    }

    /**
     * Called each frame.
     */

    // public onUpdate(): void {
    //     if (!this.isLocalPlayer) {
    //         return;
    //     }
    //     // Move
    //     let actionsCount = 0;
    //     let speed = 0;
    
    //     this._moveAxis.set(0, 0, 0);
    
    //     for (const key in this._actions) {
    //         const a = this._actions[key];
    //         if (!a.action || !a.direction.length()) {
    //             continue;
    //         }
    
    //         const weight = a.action.weight;
    
    //         this._moveAxis = this._moveAxis.addInPlace(a.direction.multiplyByFloats(weight, weight, weight));
    //         speed += weight * this._runSpeed;
    
    //         if (weight > 0.5) {
    //             actionsCount++;
    //         }
    //     }
    
    //     speed *= this._scene.getAnimationRatio();
    
    //     if (actionsCount > 0) {
    //         speed /= actionsCount;
    
    //         this._moveAxis.divideInPlace(new Vector3(actionsCount, actionsCount, actionsCount));
    //         this.getDirectionToRef(this._moveAxis, this._moveDirection);
    //     } else {
    //         this._moveDirection.set(0, 0, 0);
    //     }
    
    //     this._moveDirection.x *= speed;
    //     this._moveDirection.z *= speed;
    //     this._moveDirection.y = this._scene.gravity.y + this._jumpValue;
    //     this.moveWithCollisions(this._moveDirection);
    
    //     // Sync camera target
    //     const boneWorldPosition = this._targetBone.getPosition(Space.WORLD).multiply(this.scaling);
    //     const targetWorldPosition = this.absolutePosition.add(boneWorldPosition).add(new Vector3(0, 0, 0));
    
    //     this._camera.target.copyFrom(targetWorldPosition);
    
    //     if (actionsCount > 0) {
    //         this._syncRotation(-this._camera.alpha - (Math.PI * 0.5));
    //     }
    // }
    
    /**
     * Performs the action according to the given action object.
     */
    private _doAction(playerAction: IAction): void {
        if (playerAction.running) { return; }

        if (!playerAction.action) {
            const from = playerAction.invert ? playerAction.range.to : playerAction.range.from;
            const to = playerAction.invert ? playerAction.range.from : playerAction.range.to;

            playerAction.action = this._scene.beginWeightedAnimation(this.skeleton, from, to, 0, true, this._animationSpeed);
        }

        playerAction.running = true;
        this._interpolateAction(playerAction, 1);
    }

    /**
     * Cancels the given action.
     */
    private _cancelAction(playerAction: IAction): void {
        if (!playerAction.action || !playerAction.interpolation || !playerAction.running) { return; }

        playerAction.running = false;
        this._interpolateAction(playerAction, 0);
    }

    /**
     * Interpolates the given action weight.
     */
    private _interpolateAction(playerAction: IAction, to: number): void {
        if (!playerAction.interpolation) {
            playerAction.interpolation = new Animation("weight", "weight", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE, false);
        }

        playerAction.interpolation.setKeys([
            { frame: 0, value: playerAction.action.weight },
            { frame: 60, value: to },
        ]);

        this._scene.stopAnimation(playerAction.action);
        this._scene.beginDirectAnimation(playerAction.action, [playerAction.interpolation], 0, 60, false, this._transitionSpeed);
    }

    /**
     * Syncs the mesh rotation according to the current camera's direction.
     */
    private _syncRotation(targetRotation: number): void {
        const distance = this.rotation.y - targetRotation;
        const currentRotation = (distance * 0.1 - this.getEngine().getDeltaTime() * 0.001) * this._scene.getAnimationRatio();
        const amount = (distance > 0 ? Math.max(currentRotation, 0) : Math.min(currentRotation, 0));

        this.rotate(new Vector3(0, 1, 0), -amount);
        this.rotation.y -= amount;
    }

    /**
     * Called on the space key is up.
     */
    @onKeyboardEvent([32], KeyboardEventTypes.KEYUP)
    private _jump(): void {
        if (this._jumping) { return; }

        // Create jump animation
        const a = new Animation("jump", "_jumpValue", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE, false);
        a.setKeys([
            { frame: 0, value: -this._scene.gravity.y },
            { frame: 25, value: -this._scene.gravity.y + 5 },
            { frame: 50, value: 0 },
        ]);

        this._jumping = true;
        this._scene.beginDirectAnimation(this, [a], 0, 120, false, 1.0, () => {
            this._jumping = false;
        });
    }

    /**
     * Called on a keyboard key is down.
     */
    // @onKeyboardEvent([], KeyboardEventTypes.KEYDOWN)
    // private _onKeyboardDown(info: KeyboardInfo): void {
    //     if (info.event.key === "Shift") {
    //         return this._shiftDown();
    //     }

    //     const key = info.event.keyCode;

    //     let action = this._actions[key];
    //     if (!action) { return; }

    //     if (this._shift && action.shift) { action = this._actions[action.shift]; }
    //     if (!action) { return; }

    //     if (!action.running) {
    //         this._cancelAction(this._actions.idle);
    //         this._doAction(action);
    //     }
    // }

    /**
     * Called on a keyboard key is up.
     */
    // @onKeyboardEvent([], KeyboardEventTypes.KEYUP)
    // private _onKeyboardUp(info: KeyboardInfo): void {
    //     if (info.event.key === "Shift") {
    //         return this._shiftUp();
    //     }

    //     const key = info.event.keyCode;
        
    //     let action = this._actions[key];
    //     if (!action) { return; }

    //     if (this._shift && action.shift) { action = this._actions[action.shift]; }
    //     if (!action) { return; }

    //     if (action.running) {
    //         this._cancelAction(action);
    //     }

    //     // Check if no more running action.
    //     const runningActions = Object.values(this._actions).find((a) => a.running);
    //     if (!runningActions) {
    //         this._doAction(this._actions.idle);
    //     }
    // }

    /**
     * Called on the shift key is down.
     */
    private _shiftDown(): void {
        this._shift = true;

        Object.values(this._actions).forEach((a) => {
            if (!a.shift || !a.running) { return; }

            this._cancelAction(a);

            const shiftAction = this._actions[a.shift];
            if (shiftAction) {
                this._doAction(shiftAction);
            }
        });
    }

    /**
     * Called on the shift key is up.
     */
    private _shiftUp(): void {
        this._shift = false;

        // Convert shift actions to base actions. I.E: run to walk.
        const shiftActions = Object.values(this._actions).filter((a) => a.shift);
        shiftActions.forEach((sa) => {
            const action = this._actions[sa.shift];
            if (!action || !action.running) { return; }

            this._cancelAction(action);
            this._doAction(sa);
        });
    }
}
