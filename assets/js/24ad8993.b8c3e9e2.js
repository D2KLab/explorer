"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[4825],{4137:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(n),m=a,g=d["".concat(l,".").concat(m)]||d[m]||u[m]||i;return n?r.createElement(g,o(o({ref:t},s),{},{components:n})):r.createElement(g,o({ref:t},s))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9168:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>p,toc:()=>c});var r=n(7462),a=(n(7294),n(4137));const i={},o="PaginatedLink",p={unversionedId:"api/components/PaginatedLink",id:"api/components/PaginatedLink",title:"PaginatedLink",description:"Paginated link.",source:"@site/docs/api/components/PaginatedLink.md",sourceDirName:"api/components",slug:"/api/components/PaginatedLink",permalink:"/explorer/api/components/PaginatedLink",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/api/components/PaginatedLink.md",tags:[],version:"current",frontMatter:{},sidebar:"api",previous:{title:"PageTitle",permalink:"/explorer/api/components/PageTitle"},next:{title:"Pagination",permalink:"/explorer/api/components/Pagination"}},l={},c=[{value:"Props",id:"props",level:2},{value:"Example with code:",id:"example-with-code",level:2}],s={toc:c};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"paginatedlink"},"PaginatedLink"),(0,a.kt)("p",null,"Paginated link."),(0,a.kt)("h2",{id:"props"},"Props"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"id = {string}")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"type = {string}")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"searchApi = {string}")),(0,a.kt)("li",{parentName:"ul"},"Any props from ",(0,a.kt)("a",{parentName:"li",href:"https://nextjs.org/docs/api-reference/next/link"},"next/link"))),(0,a.kt)("h2",{id:"example-with-code"},"Example with code:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx"},'// highlight-start\nimport PageTitle from \'@components/PageTitle\';\n// highlight-end\n\nconst MyComponent = () => {\n  return (\n    // highlight-start\n    <PaginatedLink id="http://dbpedia.org/resource/France" type="countries" searchApi="/api/search">\n      My link\n    </PaginatedLink>\n    // highlight-end\n  );\n};\n')))}u.isMDXComponent=!0}}]);