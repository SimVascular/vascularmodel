## Overview on our repository

The Vascular Model Repository is a library of cardiovascular models. Model projects can be downloaded in `.zip` format from the <a href="dataset.html" class="link" target="_blank">Repository</a>. Each archive contains a project compatible with SimVascular, an open-source software for patient-specific cardiovascular modeling and simulation. We refer to the <a href="https://simvascular.github.io/" target="_blank" class="link">SimVascular website</a> and <a href="https://simvascular.github.io/documentation/quickguide.html" target="_blank" class="link" target="_blank">Getting started page</a> for an in-depth discussion of the software capabilities and its usage. For help to navigate our model gallery and to download SimVascular projects or simulation results, we refer to our <a href="tutorial.html">Tutorial</a>. In this documentation, we limit ourselves to recall that a SimVascular project can be opened by clicking **File > Open SV Project...** in the graphical user interface and by selecting the desired project folder.</p>

Although the models are compatible with SimVascular by design, some components (in particular, image data and computational meshes) can be easily opened in other pieces of software too.

Here is a brief description of the subfolders contained in each project:

**Images:** directory containing medical image data in `.vti` format, which can be opened, for example, using <a class="link" href="https://www.paraview.org" target="_blank">Paraview</a>.

**Paths:** directory containing path files in `*.pth` format, where `*` is usually one of the vessels making up the current model. Path files store path points (in `.xml` format) manually identified during the centerline identification stage of SimVascular.

**Segmentations:** directory containing contour files in `*.ctgr` format, where `*` is usually one of the vessels making up the current model. Contour files store contour points (in `.xml` format) manually identified during the segmentation stage of SimVascular.

**Models:** directory containing the surface model of the geometry.

**Meshes:** directory containing the meshes of the model. Surface meshes are stored in `.vtp`, while volumetric meshes are stored in `.msh` and `.vtu` formats; `.vtp` and `.vtu` files can be opened, for example, using <a class="link" href="https://www.paraview.org" target="_blank">Paraview</a>.

**flow-files:** directory containing inflow boundary conditions. These as stored in files called `inflow_3d.flow`, i.e., as raw text files in which each row corresponds to a particular timestep and flowrate value. Note that, in SimVascular, a positive inflow requires a negative sign (as the normal to the inlet surface and the velocity field have opposite orientations).

**Simulations:** directory containing simulation files compatible with SimVascular.

In addition to SimVascular projects, some models are equipped with simulation results in `*.vtu` (volumetric) and `*.vtp` (surface) formats. These can be inspected using <a class="link" href="https://www.paraview.org" target="_blank">Paraview</a>.

<br>

## Our convention for naming models

Each model in the Vascular Model Repository follows a standard naming convention. The format of each name is **Image_Species_Anatomy_Disease.**

<br>

#### Examples:

**0012_H_AO_COA** - Medical Image 0012, Human, Aorta, Coarctation of Aorta

**0059_H_PULM_ALGS** - Medical Image 0059, Human, Pulmonary, Alagille Syndrome

**0121_A_AO_H** - Medical Image 0121, Animal, Aorta, Healthy

**0012_H_CORO_KD** - Medical Image 0012, Human, Coronary, Kawasaki Disease

<br>

The abbreviations used in each portion of the name are defined as follows:

<br>

#### Image Identifier

**####** - a unique 4-digit identifier assigned to the medical image associated with the model. The number generated for each medical image is based on when the model and its image were added to the Vascular Model Repository, so **0001** is associated with the medical image of the first model added to the Vascular Model Repository, **0002** is associated with the medical image of the second model added, and so on.

Most of the time, each model will have a unique image identifier, but there are cases where multiple models share a 4-digit image identifier if the same medical image was used when creating the model.

For example:

<img src="/img/documentation/fig1_same_image_number.png"/>

In this case, the coronary model **0146_H_CORO_SVG** and the aorta model **0146_H_AO_H** were created from the same medical image so they share the same 4-digit image identifier **0146**.

<br>

#### Species Identifier

**H** - human subject

**A** - animal subject

<br>

#### Anatomy Identifier

**AO** - aorta

**ABAO** - abdominal aorta

**CERE** - cerebral arteries

**CORO** - coronary arteries

**PULM** - pulmonary arteries

**PULMFON** - pulmonary arteries after going through the Fontan procedure

**PULMGLN** - pulmonary arteries after going through the Glenn procedure

<br>

#### Disease Identifier

**H** - Healthy

**AAA** - Abdominal Aortic Aneurysm

**AIOD** - Aortoiliac Occlusive Disease

**ALGS** - Alagille Syndrome

**AOD** - Aortic Dissection

**CA** - Cerebral Aneurysm

**CAD** - Coronary Artery Disease

**COA** - Coarctation of Aorta

**HLHS** - Hypoplastic Left Heart Syndrome

**KD** - Kawasaki Disease

**MFS** - Marfan Syndrome

**PAH** - Pulmonary Arterial Hypertension

**PAT** - Pulmonary Atresia

**SVD** - Single Ventricle Defect

**SVGD** - Saphenous Vein Graft Disease

**TAT** - Tricuspid Atresia

**TOF** - Tetralogy of Fallot

**WS** - Williams Syndrome

<br>

#### Legacy Names

Some of the models on the Vascular Model Repository had already been given names before they were added to the repository, so in order to maintain a consistent and easily searchable repository, these models have been renamed according to our naming convention. The original names of the models, their "legacy names," are still linked with the models. We can find a model using either its legacy name or its new name with the search bar.

<img src="/img/documentation/fig2_legacy_name_example.png"/>

<br>

## Our convention for naming simulation results

Each simulation result in the Vascular Model Repository follows a standard naming convention. The format of each name is **Model_Simulation fidelity_Simulation type_Boundary condition (optional)\_File type.**

<br>

#### Examples:

**0241_H_CORO_KD_3D_FSI_REST_VTP.zip** - 3D, FSI simulation, resting condition, `.vtp` file

**0241_H_CORO_KD_FSI_HYPER_VTU.zip** - 3D, FSI simulation, hyperemic condition, `.vtu` file

<br>

The abbreviations used in each portion of the name are defined as follows:

<br>

#### Simulation Fidelity Identifier

**0D** - zero-dimensional spatial representation of a vascular network modeled as an electrical circuit

**1D** - solves for blood pressure and flow in deformable one-dimensional hemodynamic networks.

**3D** - full three-dimensional simulation

<br>

#### Simulation Type Identifier

**RIGID** - Rigid Wall simulation

**FSI** - Fluid Solid Interaction simulation (deformable walls)

<br>

#### Boundary Condition Identifier (optional)

**REST** - Simulations run at resting conditions

**HYPER** - Simulations run at hyperemic conditions (exercise conditions)

<br>

#### File Type Identifier

**VTP** - `.vtp` files (surface mesh simulation results)

**VTU** - `.vtu` files (volume mesh simulation results)

<br>

However, throughout our website, a shortened version of the simulation result file name, which only includes the image identifier, is displayed.

<img src="/img/documentation/fig3_shortened_sim_results_name.png"/>

Once downloaded, the name of the simulation result file will show in full, with both the image identifier and the name of the model.

<br>

## The history of our repository

The Vascular Model Repository was originally created by
<a class="link" href="https://www.anderson.ucla.edu/faculty-and-research/global-economics-and-management/faculty/wilson" target="_blank">Nathan Wilson</a>
and the Open Source Medical Software Corporation (OSMSC) under contract HHSN268201100035C with the National Institute of Health (NIH).
The repository has then been migrated into its current form in a joint effort between the <a href="https://cbcl.stanford.edu" class="link" target="_blank">Cardiovascular Biomechanics Computation Lab</a>
at Stanford University, the
<a href="https://shaddenlab.berkeley.edu" class="link" target="_blank">Shadden Lab</a>
at Berkeley University, and Nathan Wilson. The project is currently supported by the NIH National Library of Medicine (grant 5R01LM013120).

<br>

## References

We refer to the following publications for additional details on the Vascular Model Repository. If you find the repository useful, please consider citing these references.

N.M. Wilson, A.K. Ortiz, and A.B. Johnson,
_The Vascular Model Repository: A Public Resource of Medical Imaging Data and Blood Flow Simulation Results_,
J. Med. Devices 7(4), 040923 (Dec 05, 2013) doi:10.1115/1.4025983.

M.R. Pfaller, J. Pham, A. Verma, N.M. Wilson, D.W. Parker, W. Yang, and A.L. Marsden,
_Automated generation of 0D and 1D reduced-order models of patient-specific blood flow_,
arXiv:2111.04878.

<br>

## Have Questions or Comments?

Still have questions? Check out the <a href="FAQs.html">FAQs</a> page.

Let us know what functions you would like to see in the Vascular Model Repository by <a href="contacts.html" target="_blank">contacting us.</a>
