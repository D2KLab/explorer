"use strict";(self.webpackChunkexplorer_docs=self.webpackChunkexplorer_docs||[]).push([[303],{4137:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),d=s(n),m=a,g=d["".concat(p,".").concat(m)]||d[m]||u[m]||o;return n?r.createElement(g,l(l({ref:t},c),{},{components:n})):r.createElement(g,l({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=d;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var s=2;s<o;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},3468:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>s});var r=n(7462),a=(n(7294),n(4137));const o={slug:"/creating-pages",sidebar_label:"Pages"},l="Creating Pages",i={unversionedId:"guides/creating-pages",id:"guides/creating-pages",title:"Creating Pages",description:"In this section, we will learn about creating pages in D2KLab Explorer.",source:"@site/docs/guides/creating-pages.md",sourceDirName:"guides",slug:"/creating-pages",permalink:"/creating-pages",draft:!1,editUrl:"https://github.com/D2KLab/explorer/tree/master/docs/docs/guides/creating-pages.md",tags:[],version:"current",frontMatter:{slug:"/creating-pages",sidebar_label:"Pages"},sidebar:"docs",previous:{title:"Guides",permalink:"/category/guides"}},p={},s=[{value:"Add a page",id:"add-a-react-page",level:2},{value:"Routing",id:"routing",level:2}],c={toc:s};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"creating-pages"},"Creating Pages"),(0,a.kt)("p",null,"In this section, we will learn about creating pages in D2KLab Explorer."),(0,a.kt)("p",null,"Pages are basically React components, and can include other components or even custom ones."),(0,a.kt)("h2",{id:"add-a-react-page"},"Add a page"),(0,a.kt)("p",null,"React is used as the UI library to create pages. Every page component should export a React component, and you can leverage the expressiveness of React to build rich and interactive content."),(0,a.kt)("p",null,"Create a file ",(0,a.kt)("inlineCode",{parentName:"p"},"/src/pages/hello.js"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="/src/pages/hello.js"',title:'"/src/pages/hello.js"'},"import Layout from '@components/Layout';\nimport PageTitle from '@components/PageTitle';\nimport Header from '@components/Header';\nimport Body from '@components/Body';\nimport Footer from '@components/Footer';\n\nconst Hello = () => {\n  return (\n    <Layout>\n      <PageTitle title=\"Hello!\" />\n      <Header />\n      <Body>\n        <div\n          style={{\n            display: 'flex',\n            justifyContent: 'center',\n            alignItems: 'center',\n            height: '50vh',\n            fontSize: '20px',\n          }}\n        >\n          <p>\n            Edit <code>pages/hello.js</code> and save to reload.\n          </p>\n        </div>\n      </Body>\n      <Footer />\n    </Layout>\n  );\n}\n\nexport default Hello;\n")),(0,a.kt)("p",null,"Once you save the file, the development server will automatically reload the changes. Now open ",(0,a.kt)("a",{parentName:"p",href:"http://localhost:3000/hello"},"http://localhost:3000/hello")," and you will see the new page you just created."),(0,a.kt)("p",null,"Each page doesn't come with any styling. You will need to import the ",(0,a.kt)("inlineCode",{parentName:"p"},"Layout")," component from ",(0,a.kt)("inlineCode",{parentName:"p"},"@components/Layout")," and use ",(0,a.kt)("inlineCode",{parentName:"p"},"@components/Header")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"@components/Footer'")," if you want the navbar and/or footer to appear. You can use ",(0,a.kt)("a",{parentName:"p",href:"https://styled-components.com/"},"styled-components")," to style your components."),(0,a.kt)("h2",{id:"routing"},"Routing"),(0,a.kt)("p",null,"Any JavaScript file you create under ",(0,a.kt)("inlineCode",{parentName:"p"},"/src/pages/")," directory will be automatically converted to a website page, following the ",(0,a.kt)("inlineCode",{parentName:"p"},"/src/pages/")," directory hierarchy. For example:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"/src/pages/index.js")," \u2192 ",(0,a.kt)("inlineCode",{parentName:"li"},"[baseUrl]")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"/src/pages/foo.js")," \u2192 ",(0,a.kt)("inlineCode",{parentName:"li"},"[baseUrl]/foo")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"/src/pages/foo/test.js")," \u2192 ",(0,a.kt)("inlineCode",{parentName:"li"},"[baseUrl]/foo/test")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"/src/pages/foo/index.js")," \u2192 ",(0,a.kt)("inlineCode",{parentName:"li"},"[baseUrl]/foo/"))))}u.isMDXComponent=!0}}]);