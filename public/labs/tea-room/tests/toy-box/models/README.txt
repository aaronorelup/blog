The toy box's own model files
=============================

Most toys in the box are loaded from where the site already serves them (the tea room's rigs, the two models of
the "Jefrie in 3D" post, the crates of the "props on three budgets" post, the fighter of the Storm Bell test).
The files in this folder are light copies of Aaron's other models, made for this page only. Each is at most
1.5 MB, 35,000 triangles and 1024 px textures.

How a light copy is made
- The original is read as it is; nothing is written back to where it came from.
- Textures are resized to at most 1024 px (colour) or 512 px (the others) and saved again as WebP, with sharp.
- A model with too many triangles is simplified to about 33,000 with meshoptimizer's simplifier (it collapses
  the edges that change the shape least). Every part of a model is allowed the same small error.
- A model made only of plain colours has its parts joined by how shiny they are, with each part's colour kept on
  its corners: one toy is then a handful of draws instead of one per colour.
- A generated model whose picture is cut into thousands of scraps cannot be simplified without tearing the
  picture. Its colour is read from the picture at every corner and kept on the corner, and the light copy
  carries no picture at all.
- An FBX is first posed, baked to that one pose and saved as a GLB (three.js's FBXLoader and GLTFExporter).
- Names of files, folders and tools inside the model are removed.

What is here
- jefrie-megabonk-3k.glb       Jefrie for the Megabonk mod: 3,000 triangles, one 256 px texture. Geometry untouched.
- jefrie-retopo-5k.glb         Jefrie redrawn in about 5,000 triangles. Geometry untouched, textures 2048 -> 1024/512 px.
- jefrie-built-in-code.glb     Jefrie built by a script in Blender. 833,030 -> 32,827 triangles, 25 colours -> 7 parts.
- jefrie-hand-built-a.glb      Hand-built Jefrie with her walk (an FBX). 206,539 -> 29,998 triangles, one pose.
- jefrie-hand-built-b.glb      The other hand-built Jefrie (an FBX). 169,090 -> 29,938 triangles, one pose.
- jefrie-from-one-picture.glb  Jefrie generated from one picture. 696,205 -> 32,721 triangles, colour on the corners.
- jefrie-head.glb              Her head, generated from a close-up. 297,317 -> 34,768 triangles, colour on the corners.
- toy-diver.glb                The wind-up diver from Blackwater, with its waddle. Geometry untouched.
- jukebox.glb                  The jukebox from Blackwater. Geometry untouched, textures saved again as WebP.
- tape-recorder.glb            The tape recorder from Blackwater. Geometry untouched, textures saved again as WebP.
