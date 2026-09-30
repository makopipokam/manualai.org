class_name PwndAnimal
extends Node3D

var species := "frog"
var player: Node3D
var home_position := Vector3.ZERO
var state := "ruhig"
var development := 0
var body: MeshInstance3D
var label: Label3D
var velocity := Vector3.ZERO
var reaction_cooldown := 0.0
var dock_target := Vector3.ZERO
var has_dock_target := false

func setup(kind: String, player_node: Node3D, start_position: Vector3) -> void:
	species = kind
	player = player_node
	home_position = start_position
	global_position = start_position
	_build_visual()

func _build_visual() -> void:
	body = MeshInstance3D.new()
	var material := StandardMaterial3D.new()
	material.albedo_color = {"frog": Color("#6eb66b"), "fish": Color("#e7a05d"), "duck": Color("#e6cf86")}.get(species, Color.WHITE)
	material.roughness = 0.8
	body.material_override = material
	if species == "frog":
		var mesh := SphereMesh.new()
		mesh.radius = 0.22
		mesh.height = 0.35
		body.mesh = mesh
		body.position.y = 0.22
	elif species == "fish":
		var mesh := SphereMesh.new()
		mesh.radius = 0.18
		mesh.height = 0.34
		body.mesh = mesh
		body.scale = Vector3(1.5, 0.65, 0.8)
		body.position.y = 0.12
	else:
		var mesh := CapsuleMesh.new()
		mesh.radius = 0.25
		mesh.height = 0.8
		body.mesh = mesh
		body.rotation.z = PI / 2.0
		body.position.y = 0.4
	add_child(body)
	label = Label3D.new()
	label.text = species.capitalize()
	label.font_size = 24
	label.outline_size = 6
	label.modulate = Color(0.92, 0.96, 0.82, 0.9)
	label.position.y = 0.85
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.visible = false
	add_child(label)

func upgrade() -> void:
	development = min(development + 1, 2)
	label.text = species.capitalize() + " · Stufe " + str(development + 1)
	label.visible = true
	if body:
		body.scale *= 1.12
		var stage_colors := {
			"frog": [Color("#6eb66b"), Color("#8fd477"), Color("#c4e58b")],
			"fish": [Color("#e7a05d"), Color("#f0bd70"), Color("#ffe29a")],
			"duck": [Color("#e6cf86"), Color("#f2df9c"), Color("#fff2ba")]
		}
		var colors: Array = stage_colors.get(species, [Color.WHITE, Color.WHITE, Color.WHITE])
		(body.material_override as StandardMaterial3D).albedo_color = colors[development]

func set_dock_target(target: Vector3) -> void:
	dock_target = target
	has_dock_target = true

func _process(delta: float) -> void:
	if not player:
		return
	reaction_cooldown = max(0.0, reaction_cooldown - delta)
	var distance := global_position.distance_to(player.global_position)
	if distance < 2.1:
		label.visible = true
		if species == "frog":
			state = "beobachtet" if development > 0 else "flieht"
			if development == 0 and reaction_cooldown <= 0:
				velocity = (global_position - player.global_position).normalized() * 1.4
				reaction_cooldown = 1.2
		elif species == "fish":
			state = "flieht" if player.global_position.z < 1.5 else "beobachtet"
			velocity = (global_position - player.global_position).normalized() * (0.5 if development > 0 else 1.0)
		else:
			state = "neugierig" if development > 0 else "beobachtet"
			velocity = (player.global_position - global_position).normalized() * (0.28 if development > 1 else -0.18)
	elif species == "duck" and has_dock_target and distance_to_target() > 0.7:
		state = "geht zum Steg"
		velocity = (dock_target - global_position).normalized() * 0.3
	else:
		state = "ruhig"
		velocity = velocity.move_toward(Vector3.ZERO, delta * 1.5)
	global_position += velocity * delta
	global_position.x = clamp(global_position.x, -7.0, 7.0)
	global_position.z = clamp(global_position.z, -5.0, 5.0)
	if label:
		label.text = species.capitalize() + " · " + state

func distance_to_target() -> float:
	return global_position.distance_to(dock_target)
