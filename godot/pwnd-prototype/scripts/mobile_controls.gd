class_name PwndMobileControls
extends Control

signal move_changed(value: Vector2)
signal look_changed(delta: Vector2)
signal action_pressed(action: String)

var joystick_center := Vector2.ZERO
var joystick_radius := 74.0
var joystick_knob := Vector2.ZERO
var joystick_touch := -1
var look_touch := -1
var last_look_position := Vector2.ZERO
var action_buttons: Array[Button] = []

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build_action_buttons()
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED:
		queue_redraw()

func _build_action_buttons() -> void:
	var column := VBoxContainer.new()
	column.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	column.position = Vector2(-210, -224)
	column.size = Vector2(180, 204)
	column.add_theme_constant_override("separation", 10)
	add_child(column)
	_add_action_button(column, "QUIZ  ·  Q", "quiz")
	_add_action_button(column, "BAUEN  ·  E", "build")
	_add_action_button(column, "TIER  ·  F", "develop")
	var hint := Label.new()
	hint.text = "Tippen und halten: bewegen / umsehen"
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.add_theme_font_size_override("font_size", 12)
	hint.add_theme_color_override("font_color", Color(0.9, 0.95, 0.84, 0.82))
	hint.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	hint.position = Vector2(28, -42)
	hint.size = Vector2(260, 28)
	add_child(hint)

func _add_action_button(parent: Container, text: String, action: String) -> void:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(180, 54)
	button.add_theme_font_size_override("font_size", 18)
	button.add_theme_color_override("font_color", Color("#10251f"))
	button.add_theme_color_override("font_hover_color", Color("#10251f"))
	button.add_theme_stylebox_override("normal", _button_style(Color("#d9c477")))
	button.add_theme_stylebox_override("pressed", _button_style(Color("#9dbb83")))
	button.pressed.connect(action_pressed.emit.bind(action))
	parent.add_child(button)
	action_buttons.append(button)

func _button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(12)
	style.content_margin_left = 14
	style.content_margin_right = 14
	return style

func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		_handle_touch(event)
	elif event is InputEventScreenDrag:
		_handle_drag(event)

func _handle_touch(event: InputEventScreenTouch) -> void:
	var width := size.x
	if event.pressed:
		if event.position.x < width * 0.46 and event.position.y > size.y * 0.48 and joystick_touch == -1:
			joystick_touch = event.index
			joystick_center = event.position
			joystick_knob = event.position
			queue_redraw()
		elif event.position.x > width * 0.48 and look_touch == -1:
			look_touch = event.index
			last_look_position = event.position
	else:
		if event.index == joystick_touch:
			joystick_touch = -1
			joystick_knob = joystick_center
			move_changed.emit(Vector2.ZERO)
			queue_redraw()
		if event.index == look_touch:
			look_touch = -1

func _handle_drag(event: InputEventScreenDrag) -> void:
	if event.index == joystick_touch:
		var offset := event.position - joystick_center
		joystick_knob = joystick_center + offset.limit_length(joystick_radius)
		move_changed.emit((joystick_knob - joystick_center) / joystick_radius)
		queue_redraw()
	elif event.index == look_touch:
		look_changed.emit(event.relative)
		last_look_position = event.position

func _draw() -> void:
	var center := Vector2(112, size.y - 130)
	if joystick_touch != -1:
		center = joystick_center
		draw_circle(center, joystick_radius, Color(0.05, 0.13, 0.11, 0.40))
		draw_circle(joystick_knob, 32, Color(0.84, 0.78, 0.47, 0.82))
	else:
		draw_circle(center, joystick_radius, Color(0.05, 0.13, 0.11, 0.24))
		draw_circle(center, 32, Color(0.84, 0.78, 0.47, 0.48))
