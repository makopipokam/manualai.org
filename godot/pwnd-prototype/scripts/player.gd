class_name PwndPlayer
extends CharacterBody3D

@export var walk_speed := 4.2
@export var water_speed := 2.1
@export var mouse_sensitivity := 0.0025
@export var touch_look_sensitivity := 0.003
const MAX_TOUCH_LOOK_DELTA := 120.0
const BOOT_REST_HEIGHT := -1.22
var camera: Camera3D
var pitch := -0.18
var water_surface: MeshInstance3D
var mobile_move := Vector2.ZERO
var boot_nodes: Array[Node3D] = []
var boot_time := 0.0

func setup(water_mesh: MeshInstance3D) -> void:
	water_surface = water_mesh
	camera = Camera3D.new()
	camera.name = "FirstPersonCamera"
	camera.position = Vector3(0, 1.58, 0)
	camera.current = true
	add_child(camera)
	_build_boots()
	if not DisplayServer.is_touchscreen_available():
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _build_boots() -> void:
	var rubber := StandardMaterial3D.new()
	rubber.albedo_color = Color("#d6b848")
	rubber.roughness = 0.58
	var sole_material := StandardMaterial3D.new()
	sole_material.albedo_color = Color("#3b4837")
	sole_material.roughness = 0.9
	for side in [-1.0, 1.0]:
		var boot := Node3D.new()
		boot.name = "RubberBoot"
		boot.position = Vector3(side * 0.22, BOOT_REST_HEIGHT, -0.48)
		camera.add_child(boot)
		var shaft := MeshInstance3D.new()
		var shaft_mesh := BoxMesh.new()
		shaft_mesh.size = Vector3(0.22, 0.42, 0.22)
		shaft.mesh = shaft_mesh
		shaft.material_override = rubber
		shaft.position.y = 0.20
		boot.add_child(shaft)
		var foot := MeshInstance3D.new()
		var foot_mesh := BoxMesh.new()
		foot_mesh.size = Vector3(0.25, 0.16, 0.44)
		foot.mesh = foot_mesh
		foot.material_override = rubber
		foot.position = Vector3(0, -0.08, -0.12)
		boot.add_child(foot)
		var sole := MeshInstance3D.new()
		var sole_mesh := BoxMesh.new()
		sole_mesh.size = Vector3(0.27, 0.045, 0.46)
		sole.mesh = sole_mesh
		sole.material_override = sole_material
		sole.position = Vector3(0, -0.18, -0.12)
		boot.add_child(sole)
		boot_nodes.append(boot)

func set_mobile_move(value: Vector2) -> void:
	mobile_move = value.limit_length(1.0)

func apply_touch_look(delta: Vector2) -> void:
	_apply_look(delta.limit_length(MAX_TOUCH_LOOK_DELTA), touch_look_sensitivity)

func apply_mouse_look(delta: Vector2) -> void:
	_apply_look(delta, mouse_sensitivity)

func _apply_look(delta: Vector2, sensitivity: float) -> void:
	rotate_y(-delta.x * sensitivity)
	pitch = clamp(pitch - delta.y * sensitivity, -1.2, 1.0)
	camera.rotation.x = pitch

func is_in_water() -> bool:
	if water_surface == null or water_surface.mesh == null:
		return false
	# Detect wading in the visible footprint; its thin surface is not a solid floor.
	var bounds: AABB = water_surface.mesh.get_aabb()
	var local_position: Vector3 = water_surface.to_local(global_position)
	return local_position.x >= bounds.position.x and local_position.x <= bounds.end.x \
		and local_position.z >= bounds.position.z and local_position.z <= bounds.end.z

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		apply_mouse_look(event.relative)
	if event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED else Input.MOUSE_MODE_CAPTURED

func _physics_process(delta: float) -> void:
	var input_vec := mobile_move if mobile_move.length() > 0.05 else Input.get_vector("left", "right", "forward", "back")
	var direction := (transform.basis * Vector3(input_vec.x, 0, input_vec.y)).normalized()
	var in_water := is_in_water()
	var speed := water_speed if in_water else walk_speed
	velocity.x = move_toward(velocity.x, direction.x * speed, 18.0 * delta)
	velocity.z = move_toward(velocity.z, direction.z * speed, 18.0 * delta)
	velocity.y = 0
	move_and_slide()
	global_position.x = clamp(global_position.x, -10.0, 10.0)
	global_position.z = clamp(global_position.z, -7.5, 7.5)
	_animate_boots(delta, input_vec, in_water)

func _animate_boots(delta: float, input_vec: Vector2, in_water: bool) -> void:
	if boot_nodes.is_empty():
		return
	boot_time += delta
	var moving := input_vec.length() > 0.05
	for index in range(boot_nodes.size()):
		var boot := boot_nodes[index]
		var phase := boot_time * (5.0 if in_water else 7.5) + index * PI
		var amount := 0.028 if moving else 0.006
		var bob := sin(phase) * amount
		boot.position.y = lerp(boot.position.y, BOOT_REST_HEIGHT + bob, min(delta * 12.0, 1.0))
		boot.rotation.x = lerp(boot.rotation.x, sin(phase) * (0.045 if moving else 0.012), min(delta * 12.0, 1.0))
