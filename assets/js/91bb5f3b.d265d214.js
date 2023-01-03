"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[6809],{4137:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>d});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),m=c(n),d=o,y=m["".concat(p,".").concat(d)]||m[d]||s[d]||a;return n?r.createElement(y,i(i({ref:t},u),{},{components:n})):r.createElement(y,i({ref:t},u))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var c=2;c<a;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8641:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>s,frontMatter:()=>a,metadata:()=>l,toc:()=>c});var r=n(7462),o=(n(7294),n(4137));const a={},i="Layout",l={unversionedId:"api/components/Layout",id:"api/components/Layout",title:"Layout",description:"Main layout container. Contains global styles and the burger menu.",source:"@site/docs/api/components/Layout.md",sourceDirName:"api/components",slug:"/api/components/Layout",permalink:"/explorer/api/components/Layout",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/api/components/Layout.md",tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"LanguageSwitch",permalink:"/explorer/api/components/LanguageSwitch"},next:{title:"Media",permalink:"/explorer/api/components/Media"}},p={},c=[{value:"Props",id:"props",level:2},{value:"Example with code",id:"example-with-code",level:2}],u={toc:c};function s(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"layout"},"Layout"),(0,o.kt)("p",null,"Main layout container. Contains global styles and the burger menu."),(0,o.kt)("h2",{id:"props"},"Props"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"children = {React.ReactNode}"),(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"React children prop")))),(0,o.kt)("h2",{id:"example-with-code"},"Example with code"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"// highlight-start\nimport Layout from '@components/Layout';\n// highlight-end\n\nconst MyComponent = () => {\n  return (\n    // highlight-start\n    <Layout>\n    // highlight-end\n      <Header />\n      <Body>\n        Your content\n      </Body>\n      <Footer />\n    // highlight-start\n    </Layout>\n    // highlight-end\n  );\n};\n")))}s.isMDXComponent=!0}}]);