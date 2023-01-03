"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[383],{4137:(e,t,r)=>{r.d(t,{Zo:()=>s,kt:()=>f});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var i=n.createContext({}),l=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):p(p({},t),e)),r},s=function(e){var t=l(e.components);return n.createElement(i.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),u=l(r),f=o,d=u["".concat(i,".").concat(f)]||u[f]||m[f]||a;return r?n.createElement(d,p(p({ref:t},s),{},{components:r})):n.createElement(d,p({ref:t},s))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,p=new Array(a);p[0]=u;var c={};for(var i in t)hasOwnProperty.call(t,i)&&(c[i]=t[i]);c.originalType=e,c.mdxType="string"==typeof e?e:o,p[1]=c;for(var l=2;l<a;l++)p[l]=r[l];return n.createElement.apply(null,p)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},8868:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>i,contentTitle:()=>p,default:()=>m,frontMatter:()=>a,metadata:()=>c,toc:()=>l});var n=r(7462),o=(r(7294),r(4137));const a={},p="Footer",c={unversionedId:"api/components/Footer",id:"api/components/Footer",title:"Footer",description:"Footer element.",source:"@site/docs/api/components/Footer.md",sourceDirName:"api/components",slug:"/api/components/Footer",permalink:"/explorer/api/components/Footer",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/api/components/Footer.md",tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"Element",permalink:"/explorer/api/components/Element"},next:{title:"GraphIcon",permalink:"/explorer/api/components/GraphIcon"}},i={},l=[{value:"Example with code",id:"example-with-code",level:2}],s={toc:l};function m(e){let{components:t,...r}=e;return(0,o.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"footer"},"Footer"),(0,o.kt)("p",null,"Footer element."),(0,o.kt)("h2",{id:"example-with-code"},"Example with code"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"// highlight-start\nimport Footer from '@components/Footer';\n// highlight-end\n\nconst MyComponent = () => {\n  return (\n    // highlight-start\n    <Footer />\n    // highlight-end\n  );\n};\n")))}m.isMDXComponent=!0}}]);