"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[926],{4137:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),f=o,h=u["".concat(s,".").concat(f)]||u[f]||d[f]||a;return n?r.createElement(h,i(i({ref:t},c),{},{components:n})):r.createElement(h,i({ref:t},c))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=u;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},6559:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(7462),o=(n(7294),n(4137));const a={},i="Translations",l={unversionedId:"api/translations",id:"api/translations",title:"Translations",description:"Translation files should be placed inside the public/static/locales/ folder, where {LANG} is the language key specified in config.js.",source:"@site/docs/api/translations.md",sourceDirName:"api",slug:"/api/translations",permalink:"/explorer/api/translations",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/api/translations.md",tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"theme.js",permalink:"/explorer/api/theme"}},s={},p=[{value:"<code>home.json</code>",id:"home",level:2},{value:"<code>project.json</code>",id:"project",level:2},{value:"<code>site</code>",id:"project-site",level:3},{value:"<code>search</code>",id:"project-search",level:3},{value:"<code>footer</code>",id:"project-footer",level:3},{value:"<code>metadata</code>",id:"project-metadata",level:3},{value:"<code>routes</code>",id:"project-routes",level:3},{value:"<code>routes-descriptions</code>",id:"project-routes-descriptions",level:3},{value:"<code>filters</code>",id:"project-filters",level:3}],c={toc:p};function d(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"translations"},"Translations"),(0,o.kt)("p",null,"Translation files should be placed inside the ",(0,o.kt)("inlineCode",{parentName:"p"},"public/static/locales/{LANG}")," folder, where ",(0,o.kt)("inlineCode",{parentName:"p"},"{LANG}")," is the language key specified in ",(0,o.kt)("a",{parentName:"p",href:"config#search-languages"},"config.js"),"."),(0,o.kt)("p",null,"Translations rely on the framework ",(0,o.kt)("a",{parentName:"p",href:"https://www.i18next.com/"},"i18next")," and use the same syntax."),(0,o.kt)("h2",{id:"home"},(0,o.kt)("inlineCode",{parentName:"h2"},"home.json")),(0,o.kt)("p",null,"Contains translation keys for the homepage."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "hero": {\n    "headline": "Demo Explorer"\n  },\n  "search": {\n    "placeholder": "Search for countries within DBpedia ..."\n  },\n  "browseBy": "or browse by"\n}\n')),(0,o.kt)("h2",{id:"project"},(0,o.kt)("inlineCode",{parentName:"h2"},"project.json")),(0,o.kt)("p",null,"Contains translation keys for the project."),(0,o.kt)("details",null,(0,o.kt)("summary",null,"Full example of ",(0,o.kt)("code",null,"project.json")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "site": {\n    "description": "Description of the Explorer"\n  },\n  "search": "Search",\n  "footer": {\n    "text": "This text will appear in the footer. You can use HTML for <strong>effects</strong> and <a href=\\"https://www.w3.org/\\" target=\\"blank\\" rel=\\"noopener noreferrer\\">links</a>."\n  },\n  "metadata": {\n    "@id": "Permalink",\n    "description": "Description",\n    "language": "Language"\n  },\n  "routes": {\n    "countries": "Countries",\n  },\n  "routes-descriptions": {\n    "countries": "List of countries from DBpedia",\n  },\n  "filters": {\n    "q": "Full text search",\n    "language": "Language",\n  }\n}\n'))),(0,o.kt)("h3",{id:"project-site"},(0,o.kt)("inlineCode",{parentName:"h3"},"site")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"description")," - Description of the website, used for ",(0,o.kt)("inlineCode",{parentName:"li"},'<meta name="description">'),".")),(0,o.kt)("h3",{id:"project-search"},(0,o.kt)("inlineCode",{parentName:"h3"},"search")),(0,o.kt)("p",null,"Label of the Search button."),(0,o.kt)("h3",{id:"project-footer"},(0,o.kt)("inlineCode",{parentName:"h3"},"footer")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"text")," - Text to display in the footer. HTML is supported for this field.")),(0,o.kt)("h3",{id:"project-metadata"},(0,o.kt)("inlineCode",{parentName:"h3"},"metadata")),(0,o.kt)("p",null,"Properties in the details page will look for the corresponding key (based on the name of the property in the query) to display their labels."),(0,o.kt)("h3",{id:"project-routes"},(0,o.kt)("inlineCode",{parentName:"h3"},"routes")),(0,o.kt)("p",null,"Label to use for routes in the configuration file, based on the key of the route."),(0,o.kt)("h3",{id:"project-routes-descriptions"},(0,o.kt)("inlineCode",{parentName:"h3"},"routes-descriptions")),(0,o.kt)("p",null,"Description to use for routes in the configuration file, based on the key of the route."),(0,o.kt)("h3",{id:"project-filters"},(0,o.kt)("inlineCode",{parentName:"h3"},"filters")),(0,o.kt)("p",null,"Filters in the sidebar will look for the corresponding key (based on the ",(0,o.kt)("a",{parentName:"p",href:"/api/config#route-filters-id"},"id")," field of the filter) to display their labels."))}d.isMDXComponent=!0}}]);