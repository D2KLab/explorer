"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[1819],{4137:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>d});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var i=r.createContext({}),c=function(e){var t=r.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(i.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),u=c(n),d=o,f=u["".concat(i,".").concat(d)]||u[d]||m[d]||a;return n?r.createElement(f,l(l({ref:t},s),{},{components:n})):r.createElement(f,l({ref:t},s))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,l=new Array(a);l[0]=u;var p={};for(var i in t)hasOwnProperty.call(t,i)&&(p[i]=t[i]);p.originalType=e,p.mdxType="string"==typeof e?e:o,l[1]=p;for(var c=2;c<a;c++)l[c]=n[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},7946:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>p,toc:()=>c});var r=n(7462),o=(n(7294),n(4137));const a={},l="Element",p={unversionedId:"api/components/Element",id:"api/components/Element",title:"Element",description:"Container which extends styled-system and can be used for styling.",source:"@site/docs/api/components/Element.md",sourceDirName:"api/components",slug:"/api/components/Element",permalink:"/explorer/api/components/Element",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/api/components/Element.md",tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"Debug",permalink:"/explorer/api/components/Debug"},next:{title:"Footer",permalink:"/explorer/api/components/Footer"}},i={},c=[{value:"Props",id:"props",level:2},{value:"Example with code",id:"example-with-code",level:2}],s={toc:c};function m(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"element"},"Element"),(0,o.kt)("p",null,"Container which extends ",(0,o.kt)("a",{parentName:"p",href:"https://styled-system.com/"},"styled-system")," and can be used for styling."),(0,o.kt)("h2",{id:"props"},"Props"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Any props from ",(0,o.kt)("a",{parentName:"li",href:"https://styled-system.com/"},"styled-system"),".")),(0,o.kt)("h2",{id:"example-with-code"},"Example with code"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},'// highlight-start\nimport Element from \'@components/Element\';\n// highlight-end\n\nconst MyComponent = () => {\n  return (\n    // highlight-start\n    <Element display="flex" justifyContent="center" marginY={12}>\n      Your content\n    </Element>\n    // highlight-end\n  );\n};\n')))}m.isMDXComponent=!0}}]);