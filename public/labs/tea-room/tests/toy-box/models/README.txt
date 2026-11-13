The toy box's own model files
=============================

Most toys in the box are loaded from where the site already serves them (the tea room's rigs, the two models of
the "Jefrie in 3D" post, the crates of the "props on three budgets" post, the fighter of the Storm Bell test).
The files in this folder are light copies of Aaron's other models, made for this page only. Each is at most
1.5 MB, 35,000 triangles and 1024 px textures.

How a light copy is made
- The original is read as it is; nothing is written back to where it came from.
- Textures are resized to at most 1024 px (colour) or 512 px (the others) and saved again as WebP.
- A model with too many triangles is simplified to about 30,000 by collapsing its shortest edges first.
- Names of files and folders inside the model are removed.

What is here
- jefrie-megabonk-3k.glb   Jefrie for the Megabonk mod: 3,000 triangles, one 256 px texture. Geometry untouched.
- jefrie-retopo-5k.glb     Jefrie redrawn in about 5,000 triangles. Geometry untouched, textures 2048 -> 1024/512 px.
- toy-diver.glb            The wind-up diver from Blackwater, with its waddle. Geometry untouched.
- jukebox.glb              The jukebox from Blackwater. Geometry untouched, textures 1024 -> 1024/512 px WebP.
