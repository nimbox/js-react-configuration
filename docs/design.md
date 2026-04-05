# Design

We start with the concepts provided by the spec in
[specification.md](specification.md). We need to create a primary
distinction in which we display the preferences and we provide a way
to edit the preferences.


## Display

Preferences are hierarchical by design. The dot-delimited keys used
define the hierarchy. In order to display the preferences we need to
build a sorted hierarchy with localized values. So we need to go with
these steps:

* Localize the labels.
* Itemize the properties. Which localizes the key and creates the
  PreferenceItem.
* Build the hierarchy based on the keys, and localize the keys. 
* Apply the sorting rules to the hierarchy.

In order to build the hierarchy we need the following data:

* Scopes. The sorted list of scopes.
* Scope. The currently selected scope.
* Properties. The properties in the schema. All of them!
* Query. Text to use for filtering the properties after localization.
* Messages. The localization messages.
* Debug. Whether to log warnings when a message is missing.

The output of this process is a tree like structure that starts with
an array of nodes. Each node has a key (coming directly from the keys
of the properties) and a title (coming from the localization). It then
has children nodes which are also nodes with the same structure.

