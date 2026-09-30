class_name PwndAnimal
extends Node3D

const SPECIES_DEFINITIONS := {
	"frog": {
		"color": Color("#6eb66b"),
		"stage_colors": [Color("#6eb66b"), Color("#8fd477"), Color("#c4e58b")],
		"shape": "sphere",
		"body_y": 0.22,
		"scale": Vector3.ONE,
		"flee_speed": 1.4
	},
	"fish": {
		"color": Color("#e7a05d"),
		"stage_colors": [Color("#e7a05d"), Color("#f0bd70"), Color("#ffe29a")],
		"shape": "fish",
		"body_y": 0.12,
		"scale": Vector3(1.5, 0.65, 0.8),
		"flee_speed": 1.0
	},
	"duck": {
		"color": Color("#e6cf86"),
		"stage_colors": [Color("#e6cf86"), Color("#f2df9c"), Color("#fff2ba")],
		"shape": "capsule",
		"body_y": 0.4,
		"scale": Vector3.ONE,
		"flee_speed": 0.28
	}
}

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
	var definition: Dictionary = _definition()
	var material := StandardMaterial3D.new()
	material.albedo_color = definition.get("color", Color.WHITE)
	material.roughness = 0.8
	body.material_override = material
	if definition.get("shape", "sphere") == "sphere":
		var mesh := SphereMesh.new()
		mesh.radius = 0.22
		mesh.height = 0.35
		body.mesh = mesh
	elif definition.get("shape", "") == "fish":
		var mesh := SphereMesh.new()
		mesh.radius = 0.18
		mesh.height = 0.34
		body.mesh = mesh
		body.scale = definition.get("scale", Vector3.ONE)
	else:
		var mesh := CapsuleMesh.new()
		mesh.radius = 0.25
		mesh.height = 0.8
		body.mesh = mesh
		body.rotation.z = PI / 2.0
	body.position.y = float(definition.get("body_y", 0.22))
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
		var colors: Array = _definition().get("stage_colors", [Color.WHITE, Color.WHITE, Color.WHITE])
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
				velocity = (global_position - player.global_position).normalized() * float(_definition().get("flee_speed", 1.0))
				reaction_cooldown = 1.2
		elif species == "fish":
			state = "flieht" if _player_is_wading() else "beobachtet"
			velocity = (global_position - player.global_position).normalized() * (0.5 if development > 0 else float(_definition().get("flee_speed", 1.0)))
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

func _player_is_wading() -> bool:
	return player.has_method("is_in_water") and player.is_in_water()

func _definition() -> Dictionary:
	return SPECIES_DEFINITIONS.get(species, SPECIES_DEFINITIONS["frog"])
