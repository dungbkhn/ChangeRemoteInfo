#!/bin/bash

text16=$(ip -6 address | grep '/16' | grep 'scope global')

text32=$(ip -6 address | grep '/32' | grep 'scope global')

text64=$(ip -6 address | grep '/64' | grep 'scope global')

text128=$(ip -6 address | grep '/128' | grep 'scope global')

text=""

if [ "$text16" != "" ];
then
        text=$text16
elif [ "$text32" != "" ];
then
	text=$text32
elif [ "$text64" != "" ];
then
	text=$text64
elif [ "$text128" != "" ];
then
	text=$text128
fi


# Set comma as delimiter
IFS=' '

#Read the split words into an array based on comma delimiter
read -a strarr <<< "$text"

len=${#strarr[@]}

len=$(( $len - 1 ))

bn=$(echo "${strarr[0]}" | xargs)

an=$(echo "${strarr[1]}" | xargs)

#Print the splitted words
text=$an

# Set comma as delimiter
IFS='/'

#Read the split words into an array based on comma delimiter
read -a strarr <<< "$text"

len=${#strarr[@]}

len=$(( $len - 1 ))

bn=$(echo "${strarr[0]}" | xargs)

an=$(echo "${strarr[1]}" | xargs)

#Print the splitted words
text=$bn

echo $text 
