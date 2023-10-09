import { Badge } from "@/components/ui/badge";


export default function StructCard(
  props: {
    data: any
  }
) {
  return (
    <div className="flex flex-col items-center justify-start w-full p-4 gap-2">
      <div className="flex flex-col items-start w-full">
        <span>Types:</span>
        <div className="ps-2 flex flex-col items-start justify-start w-full">
          {
            props.data.typeParameters.map((parameter: any, index: number) => {
              return (
                <div>
                  <span className="font-mono">{parameter.isPhantom && 'phantom'} T{index}</span>
                  {
                    parameter.constraints.abilities.map((ability: string) => {
                      return <span>
                        {ability}
                      </span>
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
      <div className="flex flex-col items-start w-full">
        <span>Fields:</span>
        <div className="ps-2 flex flex-col items-start justify-start w-full">
          {
            props.data.fields.map((field: any, index: number) => {

              if (field.type.Struct != undefined) {
                return (
                  <div>
                    <span>{field.name}: </span><span className="font-mono">{field.type.Struct.address}::{field.type.Struct.module}::{field.type.Struct.name}</span>
                  </div>
                )
              } else {
                return (
                  <div>
                    <span>{field.name}: </span><span className="font-mono">{field.type}</span>
                  </div>
                )
              }
            })
          }
        </div>
      </div>
      <div className="flex flex-row justify-end w-full gap-2 py-1">
        {
          props.data.abilities.abilities.map((ability: any, index: number) => {
            return (
              <Badge key={index} variant="outline" className="font-mono">
                {ability}
              </Badge>
            )
          })
        }
      </div>
    </div>
  )
}