'use client'

import TypographyH2 from '@/components/TypographyH2'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import CodeEditorImage from '../public/CodeEditor.png'
import { Boxes, FileSearch2, PackagePlus, SquareStack, Terminal, Twitter, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

export default function Home() {

  const [activeTab, setActiveTab] = useState('editor')

  return (
    <div className='w-screen min-h-screen h-full bg-slate-950 '>
      <div className='fixed w-full backdrop-filter backdrop-blur-sm bg-opacity-30 border-b border-slate-500'>
        <div className="flex w-full flex-row justify-between items-center my-2 px-3 h-[50px] gap-2">
          <TypographyH2>Move Studio</TypographyH2>
          {/* <Twitter strokeWidth={1.25} className="w-8 h-8 mr-5 text-teal-500 hover:text-teal-300 cursor-pointer" /> */}
        </div>
        {/* <Separator /> */}
      </div>
      <div className='w-full min-h-[500px] flex flex-col items-center justify-start pt-[100px]'>
        <div className='flex flex-col items-center justify-start'>
          <span className='text-5xl font-bold'>The best <span className='bg-gradient-to-r from-sky-300 to-indigo-400 text-transparent bg-clip-text'>Sui</span> Development Suite</span>
          <span className='text-xl text-slate-400'>
            A complete Sui development suite built into your browser.
          </span>
        </div>
        {/* <Image src={CodeEditorImage} alt='' width={200} height={200} /> */}
        <a href='/build'>
          <Button className='animate-pulse hover:animate-none h-12 px-4 text-lg mt-10 shadow shadow-[3px_3px_20px_-5px_rgb(16,185,129,0.8),0px_-5px_20px_-5px_rgb(99,102,241,0.5),0_5px_20px_-5px_rgb(245,158,11,0.5)]'>
            Start building
          </Button>
        </a>
        <div className={
          'w-[1000px] min-h-[600px] mt-[75px] shadow-[0_0_75px_-10px_rgb(0,0,0,0.3)] hover:shadow-[0_0_100px_-25px_rgb(0,0,0,0.3)] transition-shadow rounded-xl bg-transparent border overflow-hidden' +
          `${activeTab === 'editor' ? ' shadow-amber-500/50 hover:shadow-amber-500 border-amber-500' : ''}` +
          `${activeTab === 'manager' ? ' shadow-emerald-500/50 hover:shadow-emerald-500 border-emerald-500' : ''}` +
          `${activeTab === 'explorer' ? ' shadow-indigo-500/50 hover:shadow-indigo-500 border-indigo-500' : ''}`
        }>
          <div className="w-full flex flex-row items-start justify-around border-b">
            <div 
              className={
                'h-[70px] grow flex flex-col items-center justify-center hover:cursor-pointer' + 
                `${activeTab === 'editor' ? ' bg-gradient-to-b from-slate-950 to-amber-500/20' : ''}`
              }
              onClick={() => setActiveTab('editor')}
            >
              <Terminal className={
                'w-5 h-5' +
                `${activeTab === 'editor' ? ' text-amber-500' : ' text-slate-400'}`
              } strokeWidth={1.25} />
              <span className={
                `${activeTab === 'editor' ? 'text-slate-100' : 'text-slate-400'}`
              }>
                Code editor
              </span>
            </div>
            <Separator orientation='vertical' className='h-[70px]' />
            <div 
              className={
                'h-[70px] grow flex flex-col items-center justify-center hover:cursor-pointer' + 
                `${activeTab === 'manager' ? ' bg-gradient-to-b from-slate-950 to-emerald-500/20' : ''}`
              }
              onClick={() => setActiveTab('manager')}
            >
              <Boxes className={
                'w-5 h-5' +
                `${activeTab === 'manager' ? ' text-emerald-500' : ' text-slate-400'}`
              } strokeWidth={1.25} />
              <span className={
                `${activeTab === 'manager' ? 'text-slate-100' : 'text-slate-400'}`
              }>
                Package manager
              </span>
            </div>
            <Separator orientation='vertical' className='h-[70px]' />
            <div 
              className={
                'h-[70px] grow flex flex-col items-center justify-center hover:cursor-pointer' + 
                `${activeTab === 'explorer' ? ' bg-gradient-to-b from-slate-950 to-indigo-500/20' : ''}`
              }
              onClick={() => setActiveTab('explorer')}
            >
              <SquareStack className={
                'w-5 h-5' +
                `${activeTab === 'explorer' ? ' text-indigo-500' : ' text-slate-400'}`
              } strokeWidth={1.25} />
              <span className={
                `${activeTab === 'explorer' ? 'text-slate-100' : 'text-slate-400'}`
              }>
                Object explorer
              </span>
            </div>
          </div>
          {
            activeTab === 'editor' &&
            <div className='h-[500px] flex flex-row items-center justify-around'>
              <div className='w-fit h-[450px] flex flex-col items-start justify-start ps-4'>
                <span className='text-3xl font-semibold bg-gradient-to-r from-yellow-300 to-amber-500 text-transparent bg-clip-text'>Code Editor</span>
                <span className='text-slate-400'>Tailored to the Sui Move language</span>
                <ul className='mt-2 list-disc text-slate-200'>
                  <li>Built in compiling</li>
                  <li>Syntax highligting for the Sui Move language</li>
                  <li>Fully integrated with Move testing framework</li>
                </ul>
              </div>
              <Image src={CodeEditorImage} alt='' height={400} />
            </div>
          }
          {
            activeTab === 'manager' &&
            <div className='h-[500px] flex flex-row items-center justify-around'>
              <div className='w-fit h-[450px] flex flex-col items-start justify-start ps-4'>
                <span className='text-3xl font-semibold bg-gradient-to-r from-teal-300 to-emerald-500 text-transparent bg-clip-text'>Package manager</span>
                <span className='text-slate-400'>Interact with deployed packages instantly</span>
                <ul className='mt-2 list-disc text-slate-200'>
                  <li>Deploy packages</li>
                  <li>Execute functions through on-chain packages</li>
                  {/* <li>Fully integrated with Move testing framework</li> */}
                </ul>
              </div>
              <Image src={CodeEditorImage} alt='' height={400} />
            </div>
          }
          {
            activeTab === 'explorer' &&
            <div className='h-[500px] flex flex-row items-center justify-around'>
              <div className='w-fit h-[450px] flex flex-col items-start justify-start ps-4'>
                <span className='text-3xl font-semibold bg-gradient-to-r from-purple-300 to-indigo-500 text-transparent bg-clip-text'>Object explorer</span>
                <span className='text-slate-400'>Access all on-chain objects</span>
                <ul className='mt-2 list-disc text-slate-200'>
                  <li>View attributes of on-chain objects</li>
                  <li>Look at object modification history in transactions</li>
                  {/* <li>Fully integrated with Move testing framework</li> */}
                </ul>
              </div>
              <Image src={CodeEditorImage} alt='' height={400} />
            </div>
          }
        </div>
        {/* <div className='mt-10 min-h-[200px]'>
          <span className="text-slate-400 text-lg">Supported by</span>
        </div> */}
      </div>
      {/* <Separator /> */}
      <div className='mt-[100px] w-full h-fit flex flex-col items-center justify-start gap-10'>
        <span className='mt-10 text-4xl font-bold'>Built for <span className='bg-gradient-to-r from-teal-300 to-emerald-500 text-transparent bg-clip-text'>Effiency</span></span>
        <div className='w-[600px] h-[100px] border rounded-xl flex flex-row bg-gradient-to-b from-slate-950 to-emerald-500/20 shadow-[0_0_40px_-10px_rgb(0,0,0,0.3)] shadow-emerald-500/50'>
          <div className='w-[200px] flex flex-col items-center justify-center'>
            <span className='text-2xl font-bold flex flex-row items-center gap-2'><PackagePlus strokeWidth={1.25} className='h-5 w-5'/>1000+</span>
            <span className='text-slate-400'>Deployed packages</span>
          </div>
          <Separator orientation='vertical' className='h-[100px]' />
          <div className='w-[200px] flex flex-col items-center justify-center'>
            <span className='text-2xl font-bold flex flex-row items-center gap-2'><FileSearch2 strokeWidth={1.25} className='h-5 w-5'/>700+</span>
            <span className='text-slate-400'>Objects views</span>
          </div>
          <Separator orientation='vertical' className='h-[100px]' />
          <div className='w-[200px] flex flex-col items-center justify-center'>
            <span className='text-2xl font-bold flex flex-row items-center gap-2'><Users strokeWidth={1.25} className='h-5 w-5'/>500+</span>
            <span className='text-slate-400'>Developers</span>
          </div>
        </div>
      </div>
      {/* <Separator /> */}
      <div className='w-full mt-[100px] min-h-[500px] flex flex-col items-center justify-start '>
        <span className='mt-10 text-4xl font-bold'><span className='bg-gradient-to-r from-purple-300 to-indigo-500 text-transparent bg-clip-text'>Loved</span> by Developers</span>
        <div className='w-fit grid grid-cols-3 mt-10 gap-2'>
          <div className='border rounded-xl w-[300px] h-[100px] shadow-[0_0_40px_-10px_rgb(0,0,0,0.3)] shadow-indigo-500/50 p-2 text-slate-300'>
            {'\"I am using movestudio and feel it is very effective in my learning of move language...\"'}
          </div>
          <div className='border rounded-xl w-[300px] h-[100px] shadow-[0_0_40px_-10px_rgb(0,0,0,0.3)] shadow-indigo-500/50 p-2 text-slate-300'>
            {'\"Honestly not sure how I\'d deploy modules to mainnet without it\"'}
          </div>
          <div className='border rounded-xl w-[300px] h-[100px] shadow-[0_0_40px_-10px_rgb(0,0,0,0.3)] shadow-indigo-500/50 p-2 text-slate-300'>
            {'\"I do consider your IDE a brilliant and super useful achievement for Sui blockchain development\"'}
          </div>
          <div className='border rounded-xl w-[300px] h-[100px] shadow-[0_0_40px_-10px_rgb(0,0,0,0.3)] shadow-indigo-500/50 p-2 text-slate-300'>
            {'\"web-based IDE is much more user-friendly\"'}
          </div>
        </div>
      </div>
    </div>
  )
}
