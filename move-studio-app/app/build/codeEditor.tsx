import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { IProject } from '../db/ProjectsDB';

const demoCode = `module demoPackage::party {

  // Libraries being used
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;

  // Object that can be deployed
  struct Balloon has key {
    id: UID,
    popped: bool
  }

  // Deploy a new balloon
  fun init(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  public entry fun pop_balloon(balloon: &mut Balloon) {
    balloon.popped = true;
  }

  public entry fun fill_up_balloon(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  // Create a new balloon object and make it available to anyone
  fun new_balloon(ctx: &mut TxContext) {
    let balloon = Balloon{
      id: object::new(ctx), 
      popped: false
    };
    transfer::share_object(balloon);
  }
            
}`

const themes = {
  "NightOwl": {
    "base": "vs-dark",
    "inherit": true,
    "rules": [
      {
        "background": "011627",
        "token": ""
      },
      {
        "foreground": "637777",
        "token": "comment"
      },
      {
        "foreground": "addb67",
        "token": "string"
      },
      {
        "foreground": "ecc48d",
        "token": "vstring.quoted"
      },
      {
        "foreground": "ecc48d",
        "token": "variable.other.readwrite.js"
      },
      {
        "foreground": "5ca7e4",
        "token": "string.regexp"
      },
      {
        "foreground": "5ca7e4",
        "token": "string.regexp keyword.other"
      },
      {
        "foreground": "5f7e97",
        "token": "meta.function punctuation.separator.comma"
      },
      {
        "foreground": "f78c6c",
        "token": "constant.numeric"
      },
      {
        "foreground": "f78c6c",
        "token": "constant.character.numeric"
      },
      {
        "foreground": "addb67",
        "token": "variable"
      },
      {
        "foreground": "c792ea",
        "token": "keyword"
      },
      {
        "foreground": "c792ea",
        "token": "punctuation.accessor"
      },
      {
        "foreground": "c792ea",
        "token": "storage"
      },
      {
        "foreground": "c792ea",
        "token": "meta.var.expr"
      },
      {
        "foreground": "c792ea",
        "token": "meta.class meta.method.declaration meta.var.expr storage.type.jsm"
      },
      {
        "foreground": "c792ea",
        "token": "storage.type.property.js"
      },
      {
        "foreground": "c792ea",
        "token": "storage.type.property.ts"
      },
      {
        "foreground": "c792ea",
        "token": "storage.type.property.tsx"
      },
      {
        "foreground": "82aaff",
        "token": "storage.type"
      },
      {
        "foreground": "ffcb8b",
        "token": "entity.name.class"
      },
      {
        "foreground": "ffcb8b",
        "token": "meta.class entity.name.type.class"
      },
      {
        "foreground": "addb67",
        "token": "entity.other.inherited-class"
      },
      {
        "foreground": "82aaff",
        "token": "entity.name.function"
      },
      {
        "foreground": "addb67",
        "token": "punctuation.definition.variable"
      },
      {
        "foreground": "d3423e",
        "token": "punctuation.section.embedded"
      },
      {
        "foreground": "d6deeb",
        "token": "punctuation.terminator.expression"
      },
      {
        "foreground": "d6deeb",
        "token": "punctuation.definition.arguments"
      },
      {
        "foreground": "d6deeb",
        "token": "punctuation.definition.array"
      },
      {
        "foreground": "d6deeb",
        "token": "punctuation.section.array"
      },
      {
        "foreground": "d6deeb",
        "token": "meta.array"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.definition.list.begin"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.definition.list.end"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.separator.arguments"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.definition.list"
      },
      {
        "foreground": "d3423e",
        "token": "string.template meta.template.expression"
      },
      {
        "foreground": "d6deeb",
        "token": "string.template punctuation.definition.string"
      },
      {
        "foreground": "c792ea",
        "fontStyle": "italic",
        "token": "italic"
      },
      {
        "foreground": "addb67",
        "fontStyle": "bold",
        "token": "bold"
      },
      {
        "foreground": "82aaff",
        "token": "constant.language"
      },
      {
        "foreground": "82aaff",
        "token": "punctuation.definition.constant"
      },
      {
        "foreground": "82aaff",
        "token": "variable.other.constant"
      },
      {
        "foreground": "7fdbca",
        "token": "support.function.construct"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.other.new"
      },
      {
        "foreground": "82aaff",
        "token": "constant.character"
      },
      {
        "foreground": "82aaff",
        "token": "constant.other"
      },
      {
        "foreground": "f78c6c",
        "token": "constant.character.escape"
      },
      {
        "foreground": "addb67",
        "token": "entity.other.inherited-class"
      },
      {
        "foreground": "d7dbe0",
        "token": "variable.parameter"
      },
      {
        "foreground": "7fdbca",
        "token": "entity.name.tag"
      },
      {
        "foreground": "cc2996",
        "token": "punctuation.definition.tag.html"
      },
      {
        "foreground": "cc2996",
        "token": "punctuation.definition.tag.begin"
      },
      {
        "foreground": "cc2996",
        "token": "punctuation.definition.tag.end"
      },
      {
        "foreground": "addb67",
        "token": "entity.other.attribute-name"
      },
      {
        "foreground": "addb67",
        "token": "entity.name.tag.custom"
      },
      {
        "foreground": "82aaff",
        "token": "support.function"
      },
      {
        "foreground": "82aaff",
        "token": "support.constant"
      },
      {
        "foreground": "7fdbca",
        "token": "upport.constant.meta.property-value"
      },
      {
        "foreground": "addb67",
        "token": "support.type"
      },
      {
        "foreground": "addb67",
        "token": "support.class"
      },
      {
        "foreground": "addb67",
        "token": "support.variable.dom"
      },
      {
        "foreground": "7fdbca",
        "token": "support.constant"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.other.special-method"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.other.new"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.other.debugger"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.control"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.comparison"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.flow.js"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.flow.ts"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.flow.tsx"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.ruby"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.module.ruby"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.class.ruby"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.def.ruby"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.loop.js"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.loop.ts"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.import.js"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.import.ts"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.import.tsx"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.from.js"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.from.ts"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.control.from.tsx"
      },
      {
        "foreground": "ffffff",
        "background": "ff2c83",
        "token": "invalid"
      },
      {
        "foreground": "ffffff",
        "background": "d3423e",
        "token": "invalid.deprecated"
      },
      {
        "foreground": "7fdbca",
        "token": "keyword.operator"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.relational"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.assignement"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.arithmetic"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.bitwise"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.increment"
      },
      {
        "foreground": "c792ea",
        "token": "keyword.operator.ternary"
      },
      {
        "foreground": "637777",
        "token": "comment.line.double-slash"
      },
      {
        "foreground": "cdebf7",
        "token": "object"
      },
      {
        "foreground": "ff5874",
        "token": "constant.language.null"
      },
      {
        "foreground": "d6deeb",
        "token": "meta.brace"
      },
      {
        "foreground": "c792ea",
        "token": "meta.delimiter.period"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.definition.string"
      },
      {
        "foreground": "ff5874",
        "token": "constant.language.boolean"
      },
      {
        "foreground": "ffffff",
        "token": "object.comma"
      },
      {
        "foreground": "7fdbca",
        "token": "variable.parameter.function"
      },
      {
        "foreground": "80cbc4",
        "token": "support.type.vendor.property-name"
      },
      {
        "foreground": "80cbc4",
        "token": "support.constant.vendor.property-value"
      },
      {
        "foreground": "80cbc4",
        "token": "support.type.property-name"
      },
      {
        "foreground": "80cbc4",
        "token": "meta.property-list entity.name.tag"
      },
      {
        "foreground": "57eaf1",
        "token": "meta.property-list entity.name.tag.reference"
      },
      {
        "foreground": "f78c6c",
        "token": "constant.other.color.rgb-value punctuation.definition.constant"
      },
      {
        "foreground": "ffeb95",
        "token": "constant.other.color"
      },
      {
        "foreground": "ffeb95",
        "token": "keyword.other.unit"
      },
      {
        "foreground": "c792ea",
        "token": "meta.selector"
      },
      {
        "foreground": "fad430",
        "token": "entity.other.attribute-name.id"
      },
      {
        "foreground": "80cbc4",
        "token": "meta.property-name"
      },
      {
        "foreground": "c792ea",
        "token": "entity.name.tag.doctype"
      },
      {
        "foreground": "c792ea",
        "token": "meta.tag.sgml.doctype"
      },
      {
        "foreground": "d9f5dd",
        "token": "punctuation.definition.parameters"
      },
      {
        "foreground": "ecc48d",
        "token": "string.quoted"
      },
      {
        "foreground": "ecc48d",
        "token": "string.quoted.double"
      },
      {
        "foreground": "ecc48d",
        "token": "string.quoted.single"
      },
      {
        "foreground": "addb67",
        "token": "support.constant.math"
      },
      {
        "foreground": "addb67",
        "token": "support.type.property-name.json"
      },
      {
        "foreground": "addb67",
        "token": "support.constant.json"
      },
      {
        "foreground": "c789d6",
        "token": "meta.structure.dictionary.value.json string.quoted.double"
      },
      {
        "foreground": "80cbc4",
        "token": "string.quoted.double.json punctuation.definition.string.json"
      },
      {
        "foreground": "ff5874",
        "token": "meta.structure.dictionary.json meta.structure.dictionary.value constant.language"
      },
      {
        "foreground": "d6deeb",
        "token": "variable.other.ruby"
      },
      {
        "foreground": "ecc48d",
        "token": "entity.name.type.class.ruby"
      },
      {
        "foreground": "ecc48d",
        "token": "keyword.control.class.ruby"
      },
      {
        "foreground": "ecc48d",
        "token": "meta.class.ruby"
      },
      {
        "foreground": "7fdbca",
        "token": "constant.language.symbol.hashkey.ruby"
      },
      {
        "foreground": "e0eddd",
        "background": "a57706",
        "fontStyle": "italic",
        "token": "meta.diff"
      },
      {
        "foreground": "e0eddd",
        "background": "a57706",
        "fontStyle": "italic",
        "token": "meta.diff.header"
      },
      {
        "foreground": "ef535090",
        "fontStyle": "italic",
        "token": "markup.deleted"
      },
      {
        "foreground": "a2bffc",
        "fontStyle": "italic",
        "token": "markup.changed"
      },
      {
        "foreground": "a2bffc",
        "fontStyle": "italic",
        "token": "meta.diff.header.git"
      },
      {
        "foreground": "a2bffc",
        "fontStyle": "italic",
        "token": "meta.diff.header.from-file"
      },
      {
        "foreground": "a2bffc",
        "fontStyle": "italic",
        "token": "meta.diff.header.to-file"
      },
      {
        "foreground": "219186",
        "background": "eae3ca",
        "token": "markup.inserted"
      },
      {
        "foreground": "d3201f",
        "token": "other.package.exclude"
      },
      {
        "foreground": "d3201f",
        "token": "other.remove"
      },
      {
        "foreground": "269186",
        "token": "other.add"
      },
      {
        "foreground": "ff5874",
        "token": "constant.language.python"
      },
      {
        "foreground": "82aaff",
        "token": "variable.parameter.function.python"
      },
      {
        "foreground": "82aaff",
        "token": "meta.function-call.arguments.python"
      },
      {
        "foreground": "b2ccd6",
        "token": "meta.function-call.python"
      },
      {
        "foreground": "b2ccd6",
        "token": "meta.function-call.generic.python"
      },
      {
        "foreground": "d6deeb",
        "token": "punctuation.python"
      },
      {
        "foreground": "addb67",
        "token": "entity.name.function.decorator.python"
      },
      {
        "foreground": "8eace3",
        "token": "source.python variable.language.special"
      },
      {
        "foreground": "82b1ff",
        "token": "markup.heading.markdown"
      },
      {
        "foreground": "c792ea",
        "fontStyle": "italic",
        "token": "markup.italic.markdown"
      },
      {
        "foreground": "addb67",
        "fontStyle": "bold",
        "token": "markup.bold.markdown"
      },
      {
        "foreground": "697098",
        "token": "markup.quote.markdown"
      },
      {
        "foreground": "80cbc4",
        "token": "markup.inline.raw.markdown"
      },
      {
        "foreground": "ff869a",
        "token": "markup.underline.link.markdown"
      },
      {
        "foreground": "ff869a",
        "token": "markup.underline.link.image.markdown"
      },
      {
        "foreground": "d6deeb",
        "token": "string.other.link.title.markdown"
      },
      {
        "foreground": "d6deeb",
        "token": "string.other.link.description.markdown"
      },
      {
        "foreground": "82b1ff",
        "token": "punctuation.definition.string.markdown"
      },
      {
        "foreground": "82b1ff",
        "token": "punctuation.definition.string.begin.markdown"
      },
      {
        "foreground": "82b1ff",
        "token": "punctuation.definition.string.end.markdown"
      },
      {
        "foreground": "82b1ff",
        "token": "meta.link.inline.markdown punctuation.definition.string"
      },
      {
        "foreground": "7fdbca",
        "token": "punctuation.definition.metadata.markdown"
      },
      {
        "foreground": "82b1ff",
        "token": "beginning.punctuation.definition.list.markdown"
      }
    ],
    "colors": {
      "editor.foreground": "#d6deeb",
      "editor.background": "#011627",
      "editor.selectionBackground": "#5f7e9779",
      "editor.lineHighlightBackground": "#010E17",
      "editorCursor.foreground": "#80a4c2",
      "editorWhitespace.foreground": "#2e2040",
      "editorIndentGuide.background": "#5e81ce52",
      "editor.selectionHighlightBorder": "#122d42"
    }
  },
}

export default function CodeEditor(
  props: {
    tabs: {path: string; name: string;}[];
    activeTab: string;
    removeTab: (tab: string) => void;
    setActiveTab: (tab: string) => void;
  }
) {

  const code = useLiveQuery(async () => {
    if (props.activeTab != '') {
      const forks = props.activeTab.split('/');
      const project = await db.projects.get(forks.shift() || '');
      let files = project?.files || [];
      while (forks.length > 1) {
        let fork = forks.shift();
        const searchedDir = files.find(file => file.name === fork);
        if (searchedDir == undefined) {
          break;
        }
        files = searchedDir.children || [];
      }
      const file = files.find(file => file.name === forks[0]);
      return file?.content || '';
    }
  }, [props.activeTab])

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      let hasMoveBeenSet = false;

      monaco.languages.getLanguages().forEach((language: { id: string; }) => {
        if (language.id === 'sui-move') {
          hasMoveBeenSet = true; 
        }
      })

      if (!hasMoveBeenSet) {
        monaco.languages.register({id: 'sui-move'});
        monaco.languages.setMonarchTokensProvider('sui-move', {
          keywords: [
            'module',
            'struct',
            'fun',
            'use',
            'has'
          ],
          typeKeywords: [
            'boolean', 'address', 'u8', 'u64', 'u128'
          ],
        
          operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
            '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
            '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
            '%=', '<<=', '>>=', '>>>='
          ],
        
          // we include these common regular expressions
          symbols:  /[=><!~?:&|+\-*\/\^%]+/,
        
          // C# style strings
          escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        
          // The main tokenizer for our languages
          tokenizer: {
            root: [
              // identifiers and keywords
              [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword',
                                          '@keywords': 'keyword',
                                          '@default': 'identifier' } }],
              [/[A-Z][\w\$]*/, 'type.identifier' ],  // to show class names nicely
        
              // whitespace
              { include: '@whitespace' },
        
              // delimiters and operators
              [/[{}()\[\]]/, '@brackets'],
              [/[<>](?!@symbols)/, '@brackets'],
              [/@symbols/, { cases: { '@operators': 'operator',
                                      '@default'  : '' } } ],
        
              // @ annotations.
              // As an example, we emit a debugging log message on these tokens.
              // Note: message are supressed during the first load -- change some lines to see them.
              [/@\s*[a-zA-Z_\$][\w\$]*/, { token: 'annotation', log: 'annotation token: $0' }],
        
              // numbers
              [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
              [/0[xX][0-9a-fA-F]+/, 'number.hex'],
              [/\d+/, 'number'],
        
              // delimiter: after number because of .\d floats
              [/[;,.]/, 'delimiter'],
        
              // strings
              [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
              [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],
        
              // characters
              [/'[^\\']'/, 'string'],
              [/(')(@escapes)(')/, ['string','string.escape','string']],
              [/'/, 'string.invalid']
            ],
        
            comment: [
              [/[^\/*]+/, 'comment' ],
              [/\/\*/,    'comment', '@push' ],    // nested comment
              ["\\*/",    'comment', '@pop'  ],
              [/[\/*]/,   'comment' ]
            ],
        
            string: [
              [/[^\\"]+/,  'string'],
              [/@escapes/, 'string.escape'],
              [/\\./,      'string.escape.invalid'],
              [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
            ],
        
            whitespace: [
              [/[ \t\r\n]+/, 'white'],
              [/\/\*/,       'comment', '@comment' ],
              [/\/\/.*$/,    'comment'],
            ],
          },
        })
      }

      monaco.editor.defineTheme('NightOwl', themes.NightOwl);
      monaco.editor.setTheme('NightOwl')

      console.log('here is the monaco instance:', monaco);
    }
  }, [monaco]);

  const handleCodeChange = async (value: string | undefined) => {
    if (props.activeTab != '') {
      const forks = props.activeTab.split('/');
      const project = await db.projects.get(forks.shift() || '');
      let files = project?.files || [];
      while (forks.length > 1) {
        let fork = forks.shift();
        const searchedDir = files.find(file => file.name === fork);
        if (searchedDir == undefined) {
          break;
        }
        files = searchedDir.children || [];
      }
      const file = files.find(file => file.name === forks[0]);
      if (file != undefined) {
        file.content = value || '';
        await db.projects.put(project || {} as IProject);
      }
    }
  }

  return (
    <div className="rounded-lg overflow-hidden w-full h-full flex flex-col items-center justify-center border border-slate-600">
      {
        props.tabs.length > 0 &&
        <>
          <Tabs 
            className='w-full'
            activationMode='manual'
          >
          <TabsList className='w-full pl-6 justify-start rounded-none bg-slate-900'>
            {
              props.tabs.map((tab) => {
                return (
                  <TabsTrigger 
                    data-state={props.activeTab === tab.path ? 'active' : 'inactive'}
                    value={tab.path} 
                    className='font-mono flex flex-row items-center justify-center gap-1'
                    onClick={() => {
                      console.log('selected', tab.path)
                      props.setActiveTab(tab.path)
                    }}
                  >
                    {tab.name}
                    <Cross2Icon 
                      className='w-3 h-3 ml-2' 
                      onClick={(e) => {
                        e.preventDefault();
                        props.removeTab(tab.path);

                      }} 
                    />
                  </TabsTrigger>
                )
              })
            }
          </TabsList>
        </Tabs>
        <Separator />
        <div className=" w-full h-full grow">
          {
            props.activeTab != '' &&
            <Editor
              height="100%" 
              width="100%" 
              language="sui-move"
              theme={"NightOwl"}
              value={code}
              onChange={handleCodeChange}
            />
          }
        </div>
      </>
      }
    </div>
  )
}