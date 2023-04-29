"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@babylonjs/core");
var decorators_1 = require("../decorators");
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._actions = {};
        _this._shift = false;
        _this._targetBone = null;
        _this._jumping = false;
        _this._jumpValue = 0;
        _this._moveAxis = core_1.Vector3.Zero();
        _this._moveDirection = core_1.Vector3.Zero();
        _this.isLocalPlayer = false;
        _this.isReset = false;
        _this.playerSounds = {
            build: null,
            destroy: null,
            throw: null,
            explosion: null,
            transit: null,
            rawData: {
                build: null,
                destroy: null,
                throw: null,
                explosion: null,
                transit: null,
            }
        };
        _this.isDead = false;
        _this._forwardPressed = false;
        _this._backwardPressed = false;
        _this._leftPressed = false;
        _this._rightPressed = false;
        return _this;
    }
    Player.prototype.FindFace = function (bone) {
        var meshes = bone._children;
        if (meshes) {
            return meshes[0];
        }
        var children = bone.getChildren();
        for (var i = 0; i < children.length; i++) {
            return this.FindFace(children[i]);
        }
    };
    Player.prototype.onStart = function () {
        // Allow matrices interpolation.
        core_1.Animation.AllowMatricesInterpolation = true;
        // Configure ellipsoid
        this.ellipsoid.set(20, 100, 20);
        this.ellipsoidOffset.set(0, 100, 0);
        this.isLocalPlayer = true;
        // Configure actions.
        // Get the bone the camera must target
        this._targetBone = this.absolutePosition;
        this._camera = this._scene.getNodeByName("playerCamera");
        this._camera.panningAxis = core_1.Vector3.Zero();
        // Default animation, idle
    };
    Player.prototype.onUpdate = function () {
        if (!this.isLocalPlayer) {
            return;
        }
        this._moveAxis.set(0, 0, 0);
        // Update movement axis based on key states
        if (this._forwardPressed)
            this._moveAxis.z += 1;
        if (this._backwardPressed)
            this._moveAxis.z -= 1;
        if (this._leftPressed)
            this._moveAxis.x -= 1;
        if (this._rightPressed)
            this._moveAxis.x += 1;
        this._moveAxis.normalize();
        var speed = this._shift ? this._walkSpeed : this._runSpeed;
        this._moveAxis.scaleInPlace(speed * this._scene.getAnimationRatio());
        this.getDirectionToRef(this._moveAxis, this._moveDirection);
        this._moveDirection.y = this._scene.gravity.y + this._jumpValue;
        this.moveWithCollisions(this._moveDirection);
        this._camera.target.copyFrom(this._targetBone);
        if (this._moveAxis != core_1.Vector3.ZeroReadOnly) {
            this._syncRotation(-this._camera.alpha - (Math.PI * 0.5));
        }
    };
    // ... (same methods as before)
    Player.prototype._onKeyDown = function (info) {
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
    };
    Player.prototype._onKeyUp = function (info) {
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
    };
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
    Player.prototype._doAction = function (playerAction) {
        if (playerAction.running) {
            return;
        }
        if (!playerAction.action) {
            var from = playerAction.invert ? playerAction.range.to : playerAction.range.from;
            var to = playerAction.invert ? playerAction.range.from : playerAction.range.to;
            playerAction.action = this._scene.beginWeightedAnimation(this.skeleton, from, to, 0, true, this._animationSpeed);
        }
        playerAction.running = true;
        this._interpolateAction(playerAction, 1);
    };
    /**
     * Cancels the given action.
     */
    Player.prototype._cancelAction = function (playerAction) {
        if (!playerAction.action || !playerAction.interpolation || !playerAction.running) {
            return;
        }
        playerAction.running = false;
        this._interpolateAction(playerAction, 0);
    };
    /**
     * Interpolates the given action weight.
     */
    Player.prototype._interpolateAction = function (playerAction, to) {
        if (!playerAction.interpolation) {
            playerAction.interpolation = new core_1.Animation("weight", "weight", 60, core_1.Animation.ANIMATIONTYPE_FLOAT, core_1.Animation.ANIMATIONLOOPMODE_RELATIVE, false);
        }
        playerAction.interpolation.setKeys([
            { frame: 0, value: playerAction.action.weight },
            { frame: 60, value: to },
        ]);
        this._scene.stopAnimation(playerAction.action);
        this._scene.beginDirectAnimation(playerAction.action, [playerAction.interpolation], 0, 60, false, this._transitionSpeed);
    };
    /**
     * Syncs the mesh rotation according to the current camera's direction.
     */
    Player.prototype._syncRotation = function (targetRotation) {
        var distance = this.rotation.y - targetRotation;
        var currentRotation = (distance * 0.1 - this.getEngine().getDeltaTime() * 0.001) * this._scene.getAnimationRatio();
        var amount = (distance > 0 ? Math.max(currentRotation, 0) : Math.min(currentRotation, 0));
        this.rotate(new core_1.Vector3(0, 1, 0), -amount);
        this.rotation.y -= amount;
    };
    /**
     * Called on the space key is up.
     */
    Player.prototype._jump = function () {
        var _this = this;
        if (this._jumping) {
            return;
        }
        // Create jump animation
        var a = new core_1.Animation("jump", "_jumpValue", 60, core_1.Animation.ANIMATIONTYPE_FLOAT, core_1.Animation.ANIMATIONLOOPMODE_RELATIVE, false);
        a.setKeys([
            { frame: 0, value: -this._scene.gravity.y },
            { frame: 25, value: -this._scene.gravity.y + 5 },
            { frame: 50, value: 0 },
        ]);
        this._jumping = true;
        this._scene.beginDirectAnimation(this, [a], 0, 120, false, 1.0, function () {
            _this._jumping = false;
        });
    };
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
    Player.prototype._shiftDown = function () {
        var _this = this;
        this._shift = true;
        Object.values(this._actions).forEach(function (a) {
            if (!a.shift || !a.running) {
                return;
            }
            _this._cancelAction(a);
            var shiftAction = _this._actions[a.shift];
            if (shiftAction) {
                _this._doAction(shiftAction);
            }
        });
    };
    /**
     * Called on the shift key is up.
     */
    Player.prototype._shiftUp = function () {
        var _this = this;
        this._shift = false;
        // Convert shift actions to base actions. I.E: run to walk.
        var shiftActions = Object.values(this._actions).filter(function (a) { return a.shift; });
        shiftActions.forEach(function (sa) {
            var action = _this._actions[sa.shift];
            if (!action || !action.running) {
                return;
            }
            _this._cancelAction(action);
            _this._doAction(sa);
        });
    };
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Forward Key", "z".charCodeAt(0))
    ], Player.prototype, "_forwardKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Backward Key", "s".charCodeAt(0))
    ], Player.prototype, "_backwardKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Left Key", "q".charCodeAt(0))
    ], Player.prototype, "_leftKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("KeyMap", "Right Key", "d".charCodeAt(0))
    ], Player.prototype, "_rightKey", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("number", "Walk Speed", 1)
    ], Player.prototype, "_walkSpeed", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("number", "Run Speed", 2)
    ], Player.prototype, "_runSpeed", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("number", "Transition Speed", 1)
    ], Player.prototype, "_transitionSpeed", void 0);
    __decorate([
        (0, decorators_1.visibleInInspector)("number", "Animation Speed", 1)
    ], Player.prototype, "_animationSpeed", void 0);
    __decorate([
        (0, decorators_1.onKeyboardEvent)([], core_1.KeyboardEventTypes.KEYDOWN)
    ], Player.prototype, "_onKeyDown", null);
    __decorate([
        (0, decorators_1.onKeyboardEvent)([], core_1.KeyboardEventTypes.KEYUP)
    ], Player.prototype, "_onKeyUp", null);
    __decorate([
        (0, decorators_1.onKeyboardEvent)([32], core_1.KeyboardEventTypes.KEYUP)
    ], Player.prototype, "_jump", null);
    return Player;
}(core_1.Mesh));
exports.default = Player;
//# sourceMappingURL=player.js.map