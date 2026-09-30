class_name PwndPlayer
extends CharacterBody3D

@export var walk_speed := 4.2
@export var water_speed := 2.1
@export var mouse_sensitivity := 0.0025
var camera: Camera3D
var pitch := -0.18
var pond_root: Node3D
var mobile_move := Vector2.ZERO

func setup(world: Node3D) -> void:
	pond_root = world
	camera = Camera3D.new()
	camera.name = "FirstPersonCamera"
	camera.position = Vector3(0, 1.58, 0)
	camera.current = true
	add_child(camera)
	if not DisplayServer.is_touchscreen_available():
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func set_mobile_move(value: Vector2) -> void:
	mobile_move = value.limit_length(1.0)

func apply_touch_look(delta: Vector2) -> void:
	rotate_y(-delta.x * mouse_sensitivity)
	pitch = clamp(pitch - delta.y * mouse_sensitivity, -1.2, 1.0)
	camera.rotation.x = pitch

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		apply_touch_look(event.relative)
	if event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED else Input.MOUSE_MODE_CAPTURED

func _physics_process(_delta: float) -> void:
	var input_vec := mobile_move if mobile_move.length() > 0.05 else Input.get_vector("left", "right", "forward", "back")
	var direction := (transform.basis * Vector3(input_vec.x, 0, input_vec.y)).normalized()
	var in_water := global_position.z < 1.2 and global_position.z > -2.8 and global_position.x > -5.5 and global_position.x < 5.5
	var speed := water_speed if in_water else walk_speed
	velocity.x = move_toward(velocity.x, direction.x * speed, 18.0 * _delta)
	velocity.z = move_toward(velocity.z, direction.z * speed, 18.0 * _delta)
	velocity.y = 0
	move_and_slide()
	global_position.x = clamp(global_position.x, -10.0, 10.0)
	global_position.z = clamp(global_position.z, -7.5, 7.5)
