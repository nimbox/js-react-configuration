# Correr Aplicación
Servidor: npm run server.
Cliente: npm run start.
Storybook: npm run storybook.

# Servidor:
/test/server.ts: Archivo principal del servidor.
/routes/app.routes.ts: Manejo de rutas.
/Schema: ruta de schemas GraphQL.

# Cliente:
/src: Carpeta de archivos tsx, edición de archivos React-Typescript.
/src/stories: stories de storybook.

# Preferencias
El mecanismo de preferencias debe ser completamente configurable basado en un `schema`. 

[https://code.visualstudio.com/api/references/contribution-points#Configuration-schema](https://code.visualstudio.com/api/references/contribution-points#Configuration-schema)

Este `schema` se parece a algo así:

```js
{
	"contributes": {
		"configuration": {
			"title": "AR",
			"properties": [
				"ar.something": {
					"type": "boolean",
					"default": false,
					"description": "Markdown",
					"deprecation": "Markdown",
					"scope": "global"
				},
				"ar.alignment": {
					"type": "string",
					"default": "left", 
					"enum": ["left", "center", "right"],
					"enumDescriptions: [
						"Izquierda",
						"Centro",
						"Derecha"
					],
					"description": "Markdown"
				}
			]
		}
	}
}
```

El `type` puede ser:
```js
enum ConfigurationType = 
	'number' | 'string' | 'enum' | 'boolean' | 
	'object';
```
El `type` puede ser extendido con:
```js
enum ExtendefConfigurationType = `${ConfigurationType}[]`;
```

El `scope` puede ser:
```js
enum ConfigurationScope = 
	'global' | 'application' | 'user';
```

El `property` puede ser:
```js
export interface ConfigurationProperty<T> {
	type: ExtendedConfigurationType<T>;
	default: T;
	description: string;
	options?: T[];
	optionsDescriptions?: string[];
	scope: ConfigurationScope;
	deprecationMessage?: string;
}
**```**

Esto es el schema:

[
	"color.decorators": {
		"type": "boolean",
		"default": false,
		"description": "Controls....",
		"scope": "global"
	},
	"default.formatter": {
		"type": "enum",
		"options": ["opcion1", "opcion2"],
		"default": "opcion2"
		"optionsDescriptions": ["Esta es la opcion 1", ]
	}
]

Esto es el dato: 
[
	"color.decorators": false,
	"default.formatter": "opcion1",
	"background.color": "gray"
]


```js
export interface NumberConfigurationProperty<T> {
	min?: number;
	max?: number;
}
```

```js
enum StringFormatConfiguration =
	'date' | 'time' | 'datetime' |
	'uri' | 'ip' | 'color' | 'email' | 'phone';
```

```js
export interface SringConfigurationProperty<T> {
	minLength?: number;
	maxLength?: number;
	pattern?: sting; // regex
	patternErrorMessage?: string;
	format: StringFormatConfiguration;
	multiline?: boolean
}
```

```js
export interface ArrayConfigurationProperty<T> {
	minItems?: number;
	maxItems?: number;
}
```

```js
export intercace ConfigurationSchema {
	title: string;
	properties: ConfigurationProperty[];
}
```

El markdown tiene sus propias particularidades para links internos entre las preferencias:

```js
[Description](configuration://ar.alignment)
```

Los tipos pueden ser acompañados de `[]` para señalizar que es un arreglo de esos tipos. Por ejemplo, `number[]` significa que la propiedad es un arreglo de números. En este caso el GUI reflejará una lista del tipo correcto.

Las propiedades pueden ser jerárquicas a efectos de facilitar el agrupamiento de las propiedades

```js
ar.format
ar.category.format
ar.category.value
ar.another.uri
ar.another.
```

Estas serán desplegadas en función del orden en que se vayan consiguiendo dentro de las preferencias.

El editor debe recibir un `schema` y una `data` que se corresponde con el schema. Si la `data` no se corresponde con el `schema` hay que decir que el editor no entiende la data.

Cuando hay un `submit` entonces tenemos que ver si mandamos todas las preferencias, o solo que lo cambió. Algo me dice que es solo lo que cambió, y eso significa que mandemos los `ar.alignment` que realmente cambiaron, los `dirty`.  ¿Cómo definir los que cambiaron? ¿Cuáles son los dirty? Hay que resolver esto.

Hay que montar un servidor que mantiene la configuración y que recibe los cambios, por propiedad. 

Hay que aislar el transport del cambio. Puede ser GraphQL, pero puede ser REST, o cualquier otra cosa. Tratemos con GraphQL como transport para este caso. Montemos un GraphQL server del otro lado que resuelva los requests.

Historias para todos los componentes. 
Aplicación para el componente final, contra un backend de GraphqlQL que provee el schema y los preferences. Y que recibe los ajustes al GraphQL de lo ‘dirty’ per property (this property changed).
