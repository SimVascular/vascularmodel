## Getting Started

The Vascular Model Repository is a library of cardiovascular models. Model projects can be downloaded in `.zip` format from the <a href="dataset.html" class="link" target="_blank">Repository</a>. Each archive contains a project compatible with SimVascular, an open-source software for patient-specific cardiovascular modeling and simulation. We refer to the <a href="https://simvascular.github.io/" target="_blank" class="link">SimVascular website</a> and <a href=https://simvascular.github.io/docsQuickGuide.html target="_blank" class="link" target="_blank">Getting started page</a> for an in-depth discussion of the software capabilities and its usage. In this documentation, we limit ourselves to recall that a SimVascular project can be opened by clicking <span style="font-weight:600">File > Open SV Project...</span> in the graphical user interface and by selecting the desired project folder.</p>

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

For help on how to navigate our model gallery and to download SimVascular projects or simulation results, we refer to our <a href="tutorial.html">Tutorial</a>.

## History

The Vascular Model Repository was originally created by
<a class="link" href="https://www.anderson.ucla.edu/faculty-and-research/global-economics-and-management/faculty/wilson" target="_blank">Nathan Wilson</a>
and the Open Source Medical Software Corporation (OSMSC) under contract HHSN268201100035C with the National Institues of Health (NIH).
The repository has then been migrated into its current form in a joint effort between the <a href="https://cbcl.stanford.edu" class="link" target="_blank">Cardiovascular Biomechanics Computation Lab</a>
at Stanford University, the
<a href="https://shaddenlab.berkeley.edu" class="link" target="_blank">Shadden Lab</a>
at Berkeley University, and Nathan Wilson. The project is currently supported by the NIH National Library of Medicine (grant 5R01LM013120).

## References

We refer to the following publications for additional details on the Vascular Model Repository. If you find the repository useful, please consider citing these references.

N.M. Wilson, A.K. Ortiz, and A.B. Johnson,
_The Vascular Model Repository: A Public Resource of Medical Imaging Data and Blood Flow Simulation Results_,
J. Med. Devices 7(4), 040923 (Dec 05, 2013) doi:10.1115/1.4025983.

M.R. Pfaller, J. Pham, A. Verma, N.M. Wilson, D.W. Parker, W. Yang, and A.L. Marsden,
_Automated generation of 0D and 1D reduced-order models of patient-specific blood flow_,
arXiv:2111.04878.

## Have Questions or Comments?

Still have questions? Check out the <a href="FAQs.html">FAQs</a> page.

Let us know what functions you would like to see in the Vascular Model Respository by <a href="contacts.html" target="_blank">contacting us.</a>
